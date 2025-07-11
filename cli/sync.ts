import { inspect } from 'util'
import { deleteAsset, downloadAsset, listObjects, uploadAsset } from '@/backend/blob'
import {
    existingAssetIds, pgEpubsBucket, insertPgRecord,
} from '@/backend/pg'
import { parseEpubFile } from '@/parser'
import { uploadBooqImages } from '@/backend/images'
import { redis } from '@/backend/db'
import { CliOptions } from './main'

type AssetRecord = {
    assetId: string,
    asset: Buffer,
}

export async function sync(options: CliOptions) {
    const [command] = options.commands
    switch (command) {
        case 'web2blob':
            await syncWebToBlob(options)
            return
        case 'blob2db':
            await syncBlobToDB(options)
            return
        case 'blob-cleanup':
            await blobCleanup(options)
            return
        default:
            console.info('Unknown command: ', command)
            return
    }
}

async function syncWebToBlob(options: CliOptions) {
    info('Syncing web to blob storage...')
    const retryProblems = options.switches['retry-problems'] === 'true'
    const limitSwitch = options.switches['limit']
    const webIds = limitSwitch
        ? allGutenbergIdsUpTo(parseInt(limitSwitch))
        : await getAllGutenbergIds()
    const blobIds = await Array.fromAsync(existingBlobIds())
    info(`Found ${webIds.length} ids in Gutenberg Collection`)
    info(`Found ${blobIds.length} ids in blob storage`)
    const existingSet = new Set(blobIds)
    const downloadProblemsSet = retryProblems ? new Set() : new Set(await getProblemIds('download'))
    info(`Found ${downloadProblemsSet.size} download problems: ${Array.from(downloadProblemsSet).join(', ')}`)
    const ignoreSet = new Set(await getProblemIds('ignore'))
    info(`Found ${ignoreSet.size} ids in ignore set: ${Array.from(ignoreSet).join(', ')}`)

    let successfullyProcessed = 0
    let newProblems = 0

    for (const id of webIds) {
        if (existingSet.has(id)) {
            info(`Skipping ${id} because it already exists in blob storage`)
            continue
        }
        if (ignoreSet.has(id)) {
            info(`Skipping ${id} because it is in ignore set`)
            continue
        }
        if (!retryProblems && downloadProblemsSet.has(id)) {
            info(`Skipping ${id} because it has download problems`)
            continue
        }
        try {
            const assetRecord = await downloadGutenbergEpub(id)
            if (!assetRecord) {
                await reportProblem(id, 'ignore', `No asset to download asset for ${id}`)
                newProblems++
                continue
            }
            info(`Downloaded gutenberg epub file: ${assetRecord.assetId}`)
            const result = await uploadAsset(pgEpubsBucket, assetRecord.assetId, assetRecord.asset)
            if (result.$metadata.httpStatusCode !== 200) {
                await reportProblem(id, 'download', `Failed to upload asset for id: ${id}`)
                newProblems++
                continue
            }
            info(`Uploaded asset for id: ${id}`)
            // Remove any previous download problems since this succeeded
            if (downloadProblemsSet.has(id)) {
                await removeProblem(id)
            }
            successfullyProcessed++
        } catch (err) {
            await reportProblem(id, 'download', 'Processing error', err)
            newProblems++
        }
    }

    info(`=== Web to Blob Sync Complete ===`)
    info(`Successfully processed: ${successfullyProcessed} files`)
    info(`New problems encountered: ${newProblems}`)
}

async function syncBlobToDB(options: CliOptions) {
    info('Syncing Blob to DB...')
    const batchSize = parseInt(options.switches['batch'] || '1')
    const retryProblems = options.switches['retry-problems'] === 'true'
    const needToUploadImages = options.switches['upload-images'] === 'true'
    const all = options.switches['all'] === 'true'
    const assetIdsInDb = await existingAssetIds()
    const existingAssetIdsSet = new Set(assetIdsInDb)
    info(`Found ${existingAssetIdsSet.size} ids in DB`)
    const parsingProblemsSet = retryProblems ? new Set() : new Set(await getProblemIds('parsing'))
    info(`Found ${parsingProblemsSet.size} parsing problems: ${Array.from(parsingProblemsSet).join(', ')}`)

    let successfullyProcessed = 0
    let newProblems = 0

    const filteredAssetIds = filterAsyncGenerator(existingBlobAssetIds(), async (assetId) => {
        if (!all && existingAssetIdsSet.has(assetId)) {
            info(`Skipping ${assetId} because it already exists in DB`)
            return false
        }
        if (!retryProblems && parsingProblemsSet.has(assetId)) {
            info(`Skipping ${assetId} because it has parsing problems`)
            return false
        }
        return true
    })
    let count = 0
    for await (const batch of makeBatches(filteredAssetIds, batchSize)) {
        info(`Processing batch ${count++} with ${batch.length} assets...`)
        const promises = batch.map(async (assetId) => {
            try {
                const id = idFromAssetId(assetId)
                if (!id) {
                    warn(`Couldn't get id from assetId: ${assetId}`)
                    return { success: false, newProblem: false }
                }
                const asset = await downloadAsset(pgEpubsBucket, assetId)
                if (!asset) {
                    warn(`Couldn't download asset for id: ${id}`)
                    return { success: false, newProblem: false }
                }
                const parseResult = await parseAndInsert({
                    id,
                    record: {
                        asset, assetId,
                    },
                    needToUploadImages,
                })
                if (!parseResult) {
                    await reportProblem(assetId, 'parsing', 'Failed to parse and insert')
                    return { success: false, newProblem: true }
                }
                info(`Parsed and inserted ${assetId}`)
                info(`Successfully processed ${assetId}`)
                // Remove any previous parsing problems since this succeeded
                if (parsingProblemsSet.has(assetId)) {
                    await removeProblem(assetId)
                }
                return { success: true, newProblem: false }
            } catch (err) {
                console.error(`Error processing ${assetId}`, err)
                await reportProblem(assetId, 'parsing', 'Processing error', err)
                return { success: false, newProblem: true }
            }
        })
        const results = await Promise.all(promises)

        // Count results
        for (const result of results) {
            if (result.success) {
                successfullyProcessed++
            }
            if (result.newProblem) {
                newProblems++
            }
        }
    }

    info(`=== Blob to DB Sync Complete ===`)
    info(`Successfully processed: ${successfullyProcessed} files`)
    info(`New problems encountered: ${newProblems}`)
}

async function* filterAsyncGenerator<T>(generator: AsyncGenerator<T>, predicate: (item: T) => Promise<boolean>) {
    for await (const item of generator) {
        if (await predicate(item)) {
            yield item
        }
    }
}

async function blobCleanup(_options: CliOptions) {
    info('Cleaning up Blob storage...')
    const assetIds = await Array.fromAsync(existingBlobAssetIds())
    function precedence(assetId: string): number {
        if (assetId.endsWith('-images-3.epub')) return 3
        if (assetId.endsWith('-images.epub')) return 2
        if (assetId.endsWith('.epub')) return 1
        return 0
    }

    const bestAssets = new Map<string, string>()

    for (const assetId of assetIds) {
        const numericId = idFromAssetId(assetId)
        if (!numericId) continue

        const currentBest = bestAssets.get(numericId)
        if (!currentBest || precedence(assetId) > precedence(currentBest)) {
            bestAssets.set(numericId, assetId)
        }
    }

    const toKeep = new Set(bestAssets.values())
    const toDelete = assetIds.filter(assetId => !toKeep.has(assetId))
    info(`Found ${toDelete.length} assets to delete from blob storage`)
    let count = 0
    for (const assetId of toDelete) {
        info(`Deleting asset: ${assetId}`)
        try {
            const result = await deleteAsset(pgEpubsBucket, assetId)
            if (result.$metadata.httpStatusCode === 204) {
                info(`Successfully deleted asset: ${assetId}`)
                count++
            } else {
                warn(`Failed to delete asset ${assetId}: ${result.$metadata.httpStatusCode}`)
            }
        }
        catch (err) {
            warn(`Failed to delete asset ${assetId}`, err)
        }
    }
    info(`Deleted ${count} assets from blob storage`)
}

async function* existingBlobIds() {
    for await (const assetId of existingBlobAssetIds()) {
        const id = idFromAssetId(assetId)
        if (id) {
            yield id
        } else {
            warn('Skipping non-pg-epub asset:', assetId)
        }
    }
}

async function* existingBlobAssetIds() {
    for await (const object of listObjects(pgEpubsBucket)) {
        if (object.Key) {
            yield object.Key
        } else {
            warn(`Invalid object in blob: ${object}`)
        }
    }
}

async function* makeBatches<T>(generator: AsyncGenerator<T>, batchSize: number) {
    let batch: T[] = []
    for await (const item of generator) {
        batch.push(item)
        if (batch.length >= batchSize) {
            yield batch
            batch = []
        }
    }
    if (batch.length > 0) {
        yield batch
    }
}

function idFromAssetId(assetId: string) {
    const match = assetId.match(/^pg(\d+)[^.]*\.epub$/i)
    if (match) {
        return match[1]
    }
    return undefined
}

async function parseAndInsert({
    id, record: { assetId, asset }, needToUploadImages,
}: {
    id: string,
    record: AssetRecord,
    needToUploadImages: boolean,
}) {
    info(`Processing ${assetId}`)
    const { value: booq, diags } = await parseEpubFile({
        fileBuffer: asset as any,
    })
    if (!booq) {
        info(`Couldn't parse epub: ${assetId}`)
        await reportProblem(assetId, 'parsing', 'Parsing errors', diags)
        return
    }

    // Upload images after parsing but before database insert
    if (needToUploadImages) {
        info(`Uploading images for ${assetId}`)
        const imagesResults = await uploadBooqImages(`pg/${id}`, booq)
        let hasImageErrors = false
        for (const imageResult of imagesResults) {
            if (!imageResult.success) {
                await reportProblem(assetId, 'parsing', `Image upload error: Failed to upload image: ${imageResult.id}`)
                hasImageErrors = true
            }
        }
        // If there were image errors, don't proceed with database insert
        if (hasImageErrors) {
            return
        }
    }

    const insertResult = await insertPgRecord({ booq, assetId, id })
    return insertResult !== undefined
        ? { booq }
        : undefined
}

async function getProblemIds(label: string): Promise<string[]> {
    const problems = await redis.hgetall('pg:problems')
    if (!problems) {
        return []
    }
    const ids: string[] = []
    for (const [id, problemData] of Object.entries(problems)) {
        if (problemData && typeof problemData === 'object' && 'label' in problemData && problemData.label === label) {
            ids.push(id)
        }
    }
    return ids
}

async function reportProblem(id: string, label: string, message: string, err?: any) {
    console.error('\x1b[31m%s\x1b[0m', `PG: Problem with ${id} [${label}]: ${message}`, err)
    return redis.hset('pg:problems', {
        [id]: {
            label,
            message,
            err,
        },
    })
}

async function removeProblem(id: string) {
    return redis.hdel('pg:problems', id)
}

function info(label: string, data?: any) {
    console.info('\x1b[32m%s\x1b[0m', label)
    if (data) {
        console.info(inspect(data, false, 3, true))
    }
}

function warn(label: string, data?: any) {
    console.warn('\x1b[33m%s\x1b[0m', label)
    if (data) {
        console.warn(inspect(data, false, 3, true))
    }
}

function allGutenbergIdsUpTo(limit: number): string[] {
    const ids: string[] = []
    for (let i = 1; i <= limit; i++) {
        ids.push(i.toString())
    }
    return ids
}

async function getAllGutenbergIds(): Promise<string[]> {
    const indexUrl = 'https://www.gutenberg.org/dirs/GUTINDEX.ALL'
    const res = await fetch(indexUrl)
    await politeDelay()
    const text = await res.text()

    const ids: string[] = []
    const set = new Set<string>()

    const lines = text.split('\n')
    for (const line of lines) {
        const match = line.trim().match(/\d+$/)
        if (match) {
            if (!set.has(match[0])) {
                set.add(match[0])
                ids.push(match[0])
            }
        }
    }

    return ids
}

async function downloadGutenbergEpub(id: string): Promise<AssetRecord | undefined> {
    const urls = [
        `https://www.gutenberg.org/ebooks/${id}.epub3.images`,
        `https://www.gutenberg.org/ebooks/${id}.epub.noimages`,
        `https://www.gutenberg.org/ebooks/${id}.epub`,
    ]
    for (const url of urls) {
        const result = await downloadGutenbergFile(url)
        if (result) {
            return result
        }
    }
    return undefined
}

async function downloadGutenbergFile(url: string): Promise<AssetRecord | undefined> {
    const headRes = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    await politeDelay()
    if (!headRes.ok) {
        return undefined
    }
    const finalUrl = headRes.url
    const fileName = finalUrl.split('/').pop()!
    const response = await fetch(finalUrl)
    await politeDelay()
    if (!response.ok) {
        return undefined
    }
    const arrayBuffer = await response.arrayBuffer()
    return {
        asset: Buffer.from(arrayBuffer),
        assetId: fileName,
    }
}

async function politeDelay() {
    await new Promise(resolve => setTimeout(resolve, 1000))
}