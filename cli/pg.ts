import { inspect } from 'util'
import { deleteAsset, downloadAsset, listObjects, uploadAsset } from '@/backend/blob'
import {
    existingIds, existingAssetIds, pgEpubsBucket, insertPgRecord,
} from '@/backend/pg'
import { parseEpubFile } from '@/parser'
import { redis } from '@/backend/db'
import { CliOptions } from './main'
import { uploadImagesForBooqId } from '@/backend/library'
import { BooqId } from '@/core/model'

type AssetRecord = {
    assetId: string,
    asset: Buffer,
}

function parseVerbosity(options: CliOptions): number {
    let verbosity = parseInt(options.switches['verbosity'] || '2')
    if (verbosity < 0 || verbosity > 3) {
        verbosity = 2 // Default to level 2 if invalid
    }
    return verbosity
}

export async function pg(options: CliOptions) {
    const [subcommand, subSubcommand] = options.commands

    switch (subcommand) {
        case 'sync':
            switch (subSubcommand) {
                case 'web2blob':
                    await syncWebToBlob(options)
                    return
                case 'blob2db':
                    await syncBlobToDB(options)
                    return
                case 'images':
                    await syncImages(options)
                    return
                default:
                    console.info('Unknown sync subcommand: ', subSubcommand)
                    console.info('Available sync subcommands: web2blob, blob2db')
                    return
            }
        case 'cleanup':
            switch (subSubcommand) {
                case 'blob':
                    await blobCleanup(options)
                    return
                default:
                    console.info('Unknown cleanup subcommand: ', subSubcommand)
                    console.info('Available cleanup subcommands: blob')
                    return
            }
        default:
            console.info('Unknown pg subcommand: ', subcommand)
            console.info('Available pg subcommands: sync, cleanup')
            return
    }
}

async function syncImages(options: CliOptions) {
    const verbosity = parseVerbosity(options)
    basic(verbosity, 'Syncing images...')
    const ids = await existingIds()
    const batchSize = parseInt(options.switches['batch'] || '25')
    for (const batch of makeBatches(ids, batchSize)) {
        const promises = batch.map(async (id) => {
            try {
                const booqId: BooqId = `pg-${id}`
                const { data: imagesData, fromCache } = await uploadImagesForBooqId(booqId)
                if (fromCache) {
                    basic(verbosity, `Images for ${id} already in cache`)
                } else {
                    basic(verbosity, `Uploaded images for ${id}`)
                }
                verbose(verbosity, `Finished syncing images for ${id}: ${imagesData}`)
            } catch (err) {
                warn(verbosity, `Error syncing images for ${id}`, err)
            }
        })
        await Promise.all(promises)
    }
}

async function syncWebToBlob(options: CliOptions) {
    const verbosity = parseVerbosity(options)
    basic(verbosity, 'Syncing web to blob storage...')
    const retryProblems = options.switches['retry-problems'] === 'true'
    const retryIgnored = options.switches['retry-ignored'] === 'true'
    const limitSwitch = options.switches['limit']
    const webIds = limitSwitch
        ? allGutenbergIdsUpTo(parseInt(limitSwitch))
        : await getAllGutenbergIds()
    basic(verbosity, `Found ${webIds.length} ids in Gutenberg Collection`)
    const downloadProblemsSet = new Set(await getProblemIds('download'))
    basic(verbosity, `Found ${downloadProblemsSet.size} download problems`)
    verbose(verbosity, `Download problem ids: ${Array.from(downloadProblemsSet).join(', ')}`)
    const ignoreSet = new Set(await getProblemIds('ignore'))
    basic(verbosity, `Found ${ignoreSet.size} ids in ignore set`)
    verbose(verbosity, `Ignore set ids: ${Array.from(ignoreSet).join(', ')}`)
    const blobIds = await Array.fromAsync(existingBlobIds())
    const existingSet = new Set(blobIds)
    basic(verbosity, `Found ${existingSet.size} ids in blob storage`)

    let successfullyProcessed = 0
    let newProblems = 0

    let count = 0
    for (const id of webIds) {
        if (++count % 1000 === 0) {
            basic(verbosity, `Processing id ${count}/${webIds.length}: ${id}`)
        }
        if (existingSet.has(id)) {
            verbose(verbosity, `Skipping ${id} because it already exists in blob storage`)
            continue
        }
        if (!retryIgnored && ignoreSet.has(id)) {
            verbose(verbosity, `Skipping ${id} because it is in ignore set`)
            continue
        }
        if (!retryProblems && downloadProblemsSet.has(id)) {
            verbose(verbosity, `Skipping ${id} because it has download problems`)
            continue
        }
        try {
            const assetRecord = await downloadGutenbergEpub(id)
            if (!assetRecord) {
                await reportProblem(id, 'ignore', `No asset to download asset for ${id}`)
                newProblems++
                continue
            }
            verbose(verbosity, `Downloaded gutenberg epub file: ${assetRecord.assetId}`)
            const result = await uploadAsset(pgEpubsBucket, assetRecord.assetId, assetRecord.asset)
            if (result.$metadata.httpStatusCode !== 200) {
                await reportProblem(id, 'download', `Failed to upload asset for id: ${id}`)
                newProblems++
                continue
            }
            basic(verbosity, `Uploaded asset for id: ${id}`)
            // Remove any previous problems since this succeeded
            if (downloadProblemsSet.has(id) || ignoreSet.has(id)) {
                await removeProblem(id)
            }
            successfullyProcessed++
        } catch (err) {
            await reportProblem(id, 'download', 'Processing error', err)
            newProblems++
        }
    }

    always(verbosity, `=== Web to Blob Sync Complete ===`)
    always(verbosity, `Successfully processed: ${successfullyProcessed} files`)
    always(verbosity, `New problems encountered: ${newProblems}`)
}

async function syncBlobToDB(options: CliOptions) {
    const verbosity = parseVerbosity(options)
    basic(verbosity, 'Syncing Blob to DB...')
    const batchSize = parseInt(options.switches['batch'] || '25')
    const retryProblems = options.switches['retry-problems'] === 'true'
    const all = options.switches['all'] === 'true'
    const assetIdsInDb = await existingAssetIds()
    const existingAssetIdsSet = new Set(assetIdsInDb)
    basic(verbosity, `Found ${existingAssetIdsSet.size} ids in DB`)
    const parsingProblemsSet = new Set(await getProblemIds('parsing'))
    basic(verbosity, `Found ${parsingProblemsSet.size} parsing problems`)
    verbose(verbosity, `Parsing problem ids: ${Array.from(parsingProblemsSet).join(', ')}`)

    let successfullyProcessed = 0
    let newProblems = 0

    const filteredAssetIds = filterAsyncGenerator(existingBlobAssetIds(), async (assetId) => {
        if (!all && existingAssetIdsSet.has(assetId)) {
            verbose(verbosity, `Skipping ${assetId} because it already exists in DB`)
            return false
        }
        if (!retryProblems && parsingProblemsSet.has(assetId)) {
            verbose(verbosity, `Skipping ${assetId} because it has parsing problems`)
            return false
        }
        return true
    })
    let count = 0
    for await (const batch of makeAsyncBatches(filteredAssetIds, batchSize)) {
        info(verbosity, `Processing batch ${count++} with ${batch.length} assets...`)
        const promises = batch.map(async (assetId) => {
            try {
                const id = idFromAssetId(assetId)
                if (!id) {
                    warn(verbosity, `Couldn't get id from assetId: ${assetId}`)
                    return { success: false, newProblem: false }
                }
                const asset = await downloadAsset(pgEpubsBucket, assetId)
                if (!asset) {
                    warn(verbosity, `Couldn't download asset for id: ${id}`)
                    return { success: false, newProblem: false }
                }
                const parseResult = await parseAndInsert({
                    id,
                    record: {
                        asset, assetId,
                    },
                    verbosity,
                })
                if (!parseResult) {
                    await reportProblem(assetId, 'parsing', 'Failed to parse and insert')
                    return { success: false, newProblem: true }
                }
                verbose(verbosity, `Parsed and inserted ${assetId}`)
                verbose(verbosity, `Successfully processed ${assetId}`)
                // Remove any previous parsing problems since this succeeded
                if (parsingProblemsSet.has(assetId)) {
                    await removeProblem(assetId)
                }
                return { success: true, newProblem: false }
            } catch (err) {
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

    always(verbosity, `=== Blob to DB Sync Complete ===`)
    always(verbosity, `Successfully processed: ${successfullyProcessed} files`)
    always(verbosity, `New problems encountered: ${newProblems}`)
}

async function* filterAsyncGenerator<T>(generator: AsyncGenerator<T>, predicate: (item: T) => Promise<boolean>) {
    for await (const item of generator) {
        if (await predicate(item)) {
            yield item
        }
    }
}

async function blobCleanup(options: CliOptions) {
    const verbosity = parseVerbosity(options)
    basic(verbosity, 'Cleaning up Blob storage...')
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
    basic(verbosity, `Found ${toDelete.length} assets to delete from blob storage`)
    let count = 0
    for (const assetId of toDelete) {
        verbose(verbosity, `Deleting asset: ${assetId}`)
        try {
            const result = await deleteAsset(pgEpubsBucket, assetId)
            if (result.$metadata.httpStatusCode === 204) {
                verbose(verbosity, `Successfully deleted asset: ${assetId}`)
                count++
            } else {
                warn(verbosity, `Failed to delete asset ${assetId}: ${result.$metadata.httpStatusCode}`)
            }
        }
        catch (err) {
            warn(verbosity, `Failed to delete asset ${assetId}`, err)
        }
    }
    always(verbosity, `Deleted ${count} assets from blob storage`)
}

async function* existingBlobIds() {
    for await (const assetId of existingBlobAssetIds()) {
        const id = idFromAssetId(assetId)
        if (id) {
            yield id
        } else {
            warn(2, 'Skipping non-pg-epub asset:', assetId)
        }
    }
}

async function* existingBlobAssetIds() {
    for await (const object of listObjects(pgEpubsBucket)) {
        if (object.Key) {
            yield object.Key
        } else {
            warn(2, `Invalid object in blob: ${object}`)
        }
    }
}

function* makeBatches<T>(iterable: Iterable<T>, batchSize: number) {
    let batch: T[] = []
    for (const item of iterable) {
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

async function* makeAsyncBatches<T>(generator: AsyncIterable<T>, batchSize: number) {
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
    id, record: { assetId, asset }, verbosity,
}: {
    id: string,
    record: AssetRecord,
    verbosity: number,
}) {
    verbose(verbosity, `Processing ${assetId}`)
    const { value: booq, diags } = await parseEpubFile({
        fileBuffer: asset as any,
    })
    if (!booq) {
        info(verbosity, `Couldn't parse epub: ${assetId}`)
        await reportProblem(assetId, 'parsing', 'Parsing errors', diags)
        return
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

function info(verbosity: number, label: string, data?: any, minLevel: number = 2) {
    if (verbosity >= minLevel) {
        console.info('\x1b[32m%s\x1b[0m', label)
        if (data) {
            console.info(inspect(data, false, 3, true))
        }
    }
}

function warn(verbosity: number, label: string, data?: any, minLevel: number = 1) {
    if (verbosity >= minLevel) {
        console.warn('\x1b[33m%s\x1b[0m', label)
        if (data) {
            console.warn(inspect(data, false, 3, true))
        }
    }
}

function verbose(verbosity: number, label: string, data?: any) {
    info(verbosity, label, data, 3)
}

function basic(verbosity: number, label: string, data?: any) {
    info(verbosity, label, data, 1)
}

function always(verbosity: number, label: string, data?: any) {
    info(verbosity, label, data, 0)
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