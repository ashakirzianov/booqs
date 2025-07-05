import { inspect } from 'util'
import { downloadAsset, listObjects, uploadAsset } from '@/backend/blob'
import {
    existingIds, pgEpubsBucket, insertPgRecord,
} from '@/backend/pg'
import { parseEpubFile } from '@/parser'
import { uploadBooqImages } from '@/backend/images'
import { redis } from '@/backend/db'
import { CliOptions } from './main'
import { addToSearchIndex } from '@/backend/search'

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
        default:
            console.info('Unknown command: ', command)
            return
    }
}

async function syncWebToBlob(_options: CliOptions) {
    info('Syncing web to blob storage...')
    const webIdsPromise = getAllGutenbergIds()
    const blobAssetIdsPromise = Array.fromAsync(existingBlobIds())
    const [webIds, blobIds] = await Promise.all([webIdsPromise, blobAssetIdsPromise])
    info(`Found ${webIds.length} ids in Gutenberg Collection`)
    info(`Found ${blobIds.length} ids in blob storage`)
    const existingSet = new Set(blobIds)
    for (const id of webIds) {
        if (existingSet.has(id)) {
            info(`Skipping ${id} because it already exists in blob storage`)
            continue
        }
        try {
            const assetRecord = await downloadGutenbergEpub(id)
            if (!assetRecord) {
                warn(`Couldn't download asset for ${id}`)
                continue
            }
            info(`Downloaded gutenberg epub file: ${assetRecord.assetId}`)
            const result = await uploadAsset(pgEpubsBucket, assetRecord.assetId, assetRecord.asset)
            if (result.$metadata.httpStatusCode !== 200) {
                info(`Failed to upload asset for id: ${id}`)
                continue
            }
            info(`Uploaded asset for id: ${id}`)
        } catch (err) {
            console.error(`Error processing ${id}`, err)
            await reportProblem(id, 'Processing error', err)
        }
    }
}

async function syncBlobToDB(options: CliOptions) {
    info('Syncing Blob to DB...')
    const batchSize = parseInt(options.switches['batch'] || '1')
    const retryProblems = options.switches['retry-problems'] === 'true'
    const needToUploadImages = options.switches['upload-images'] === 'true'
    const existing = await existingIds()
    info(`Found ${existing.length} ids in DB`)
    const existingIdsSet = new Set(existing)
    const filteredGenerator = filter(existingBlobAssetIds(), (id) => {
        if (existingIdsSet.has(id)) {
            info(`Skipping ${id} because it already exists in DB`)
            return false
        }
        return true
    })
    let count = 0
    for await (const batch of makeBatches(filteredGenerator, batchSize)) {
        info(`Processing batch ${count++} with ${batch.length} assets...`)
        const promises = batch.map(async (assetId) => {
            try {
                if (retryProblems && await hasProblems(assetId)) {
                    info(`Skipping ${assetId} because it has problems`)
                    return false
                }
                const id = idFromAssetId(assetId)
                if (!id) {
                    warn(`Couldn't get id from assetId: ${assetId}`)
                    return false
                }
                const asset = await downloadAsset(pgEpubsBucket, assetId)
                if (!asset) {
                    warn(`Couldn't download asset for id: ${id}`)
                    return false
                }
                const parseResult = await parseAndInsert({
                    id,
                    record: {
                        asset, assetId,
                    },
                })
                if (!parseResult) {
                    reportProblem(id, 'Failed to parse and insert', new Error('Parse error'))
                    return false
                }
                info(`Parsed and inserted ${assetId}`)
                if (needToUploadImages) {
                    info(`Uploading images for ${assetId}`)
                    await uploadBooqImages(`pg/${assetId}`, parseResult.booq)
                }
                info(`Successfully processed ${assetId}`)
                return true
            } catch (err) {
                console.error(`Error processing ${assetId}`, err)
                await reportProblem(assetId, 'Processing error', err)
            }
        })
        await Promise.all(promises)
    }
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

async function* filter<T>(
    generator: AsyncGenerator<T>,
    predicate: (item: T) => boolean,
) {
    for await (const item of generator) {
        if (predicate(item)) {
            yield item
        }
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
    id, record: { assetId, asset },
}: {
    id: string,
    record: AssetRecord,
}) {
    info(`Processing ${assetId}`)
    const { value: booq, diags } = await parseEpubFile({
        fileBuffer: asset as any,
    })
    if (!booq) {
        info(`Couldn't parse epub: ${assetId}`)
        await reportProblem(assetId, 'Parsing errors', diags)
        return
    }
    const insertResult = await insertPgRecord({ booq, assetId, id })
    if (!insertResult) {
        return undefined
    }
    const indexResult = await addToSearchIndex({
        id,
        source: 'pg',
        assetId,
        metadata: booq.metadata,
    })
    return indexResult !== undefined
        ? { booq }
        : undefined
}

async function hasProblems(id: string) {
    return redis.hexists('pg:problems', id)
}

async function reportProblem(id: string, message: string, err: any) {
    console.error(`PG: Problem with ${id}: ${message}`, err)
    return redis.hset('pg:problems', {
        [id]: {
            message, err,
        },
    })
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