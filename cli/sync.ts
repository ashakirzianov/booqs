import { inspect } from 'util'
import { downloadAsset, listObjects, uploadAsset } from '@/backend/blob'
import {
    existingIds, pgEpubsBucket, insertPgRecord,
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
        default:
            console.info('Unknown command: ', command)
            return
    }
}

async function syncWebToBlob(_options: CliOptions) {
    info('Syncing web to blob storage...')
    const webIdsPromise = getAllGutenbergIds()
    const blobAssetIdsPromise = existingBlobIds()
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
    const blobAssetIdsPromise = existingBlobIds()
    const existingIdsPromise = existingIds()
    const [blobAssetIds, existing] = await Promise.all([
        blobAssetIdsPromise, existingIdsPromise,
    ])
    info(`Found ${blobAssetIds.length} ids in blob storage`)
    info(`Found ${existing.length} ids in DB`)
    const existingIdsSet = new Set(existing.map(id => id.toString()))
    for (const assetId of blobAssetIds) {
        if (existingIdsSet.has(assetId)) {
            info(`Skipping ${assetId} because it already exists in DB`)
            continue
        }
        if (options.switches['retry-problems'] !== 'true' && await hasProblems(assetId)) {
            info(`Skipping ${assetId} because it has problems`)
            continue
        }
        try {
            const id = idFromAssetId(assetId)
            if (!id) {
                warn(`Couldn't get id from assetId: ${assetId}`)
                continue
            }
            const asset = await downloadAsset(pgEpubsBucket, assetId)
            if (!asset) {
                warn(`Couldn't download asset for id: ${id}`)
                continue
            }
            const parseResult = await parseAndInsert({
                id,
                record: {
                    asset, assetId,
                },
            })
            if (!parseResult) {
                reportProblem(id, 'Failed to parse and insert', new Error('Parse error'))
                continue
            }
            info(`Parsed and inserted ${assetId}`)
            info(`Uploading images for ${assetId}`)
            await uploadBooqImages(`pg/${assetId}`, parseResult.booq)
            info(`Uploaded images for ${assetId}`)
        } catch (err) {
            console.error(`Error processing ${assetId}`, err)
            await reportProblem(assetId, 'Processing error', err)
        }
    }
}

async function existingBlobIds() {
    const existing = []
    for await (const object of listObjects(pgEpubsBucket)) {
        const id = idFromAssetId(object.Key ?? '')
        if (id) {
            existing.push(id)
        } else {
            warn('Skipping non-pg-epub asset:', object)
        }
    }
    return existing
}

function idFromAssetId(assetId: string) {
    const match = assetId.match(/pg(\d+)(?:-images)?\.epub/)
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
    const result = await insertPgRecord({ booq, assetId, id })
    return result !== undefined
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
    const withImagesUrl = `https://www.gutenberg.org/ebooks/${id}.epub.images`
    const withImagesResult = await downloadGutenbergFile(withImagesUrl)
    if (withImagesResult) {
        return withImagesResult
    }
    const withoutImagesUrl = `https://www.gutenberg.org/ebooks/${id}.epub.noimages`
    const withoutImagesResult = await downloadGutenbergFile(withoutImagesUrl)
    if (withoutImagesResult) {
        return withoutImagesResult
    }
    const plainUrl = `https://www.gutenberg.org/ebooks/${id}.epub`
    const plainResult = await downloadGutenbergFile(plainUrl)
    if (plainResult) {
        return plainResult
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