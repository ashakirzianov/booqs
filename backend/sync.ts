import { inspect } from 'util'
import { downloadAsset } from './s3'
import {
    existingIds, pgEpubsBucket, insertPgRecord,
} from './pg'
import { parseEpub } from '@/parser'
import { uploadBooqImages } from './images'
import { redis } from './db'

type AssetRecord = {
    assetId: string,
    asset: Buffer,
}
export async function syncWithGutenberg() {
    const existing = await existingIds()
    const existingSet = new Set(existing.map(id => id.toString()))
    info(`Found ${existingSet.size} existing ids`)
    const ids = await getAllGutenbergIds()
    info(`Found ${ids.length} ids`)
    for (const id of ids) {
        if (existingSet.has(id)) {
            info(`Skipping ${id} because it already exists`)
            continue
        }
        try {
            await processId(id)
        } catch (err) {
            console.error(`Error processing ${id}`, err)
            await reportProblem(id, 'Processing error', err)
        }
    }
}

async function processId(id: string) {
    info(`Processing ${id}`)
    if (await hasProblems(id)) {
        info(`Skipping ${id} because it has problems`)
        return false
    }
    let needToUploadImages = false
    let assetRecord: AssetRecord | undefined = await existingAssetForId(id)
    if (!assetRecord) {
        info(`Downloading gutenberg epub for id: ${id}`)
        assetRecord = await downloadGutenbergEpub(id)
        if (assetRecord) {
            info(`Downloaded gutenberg epub file: ${assetRecord.assetId}`)
        }
        needToUploadImages = true
    } else {
        info(`Found existing asset for ${id}: ${assetRecord.assetId}`)
    }
    if (!assetRecord) {
        reportProblem(id, `Couldn't download asset for id: ${id}`, new Error('No asset'))
        return false
    }
    const parseResult = await parseAndInsert({
        id,
        record: assetRecord,
    })
    if (!parseResult) {
        reportProblem(id, 'Failed to parse and insert', new Error('Parse error'))
        return false
    }
    if (needToUploadImages) {
        info(`Uploading images for ${assetRecord.assetId}`)
        await uploadBooqImages(`pg/${assetRecord.assetId}`, parseResult.booq)
    }
    info(`Successfully processed ${id}`)
    return true
}

async function parseAndInsert({
    id, record: { assetId, asset },
}: {
    id: string,
    record: AssetRecord,
}) {
    info(`Processing ${assetId}`)
    const { value: booq, diags } = await parseEpub({
        fileData: asset as any,
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

async function existingAssetForId(id: string): Promise<AssetRecord | undefined> {
    const nameWithImages = `pg${id}-images.epub`
    const assetWithImages = await downloadAsset(pgEpubsBucket, nameWithImages)
    if (assetWithImages) {
        return {
            asset: assetWithImages,
            assetId: nameWithImages,
        }
    }
    const nameWithoutImages = `pg${id}.epub`
    const assetWithoutImages = await downloadAsset(pgEpubsBucket, nameWithoutImages)
    if (assetWithoutImages) {
        return {
            asset: assetWithoutImages,
            assetId: nameWithoutImages,
        }
    }
    return undefined
}

function info(label: string, data?: any) {
    console.info('\x1b[32m%s\x1b[0m', label)
    if (data) {
        console.info(inspect(data, false, 3, true))
    }
}

async function getAllGutenbergIds(): Promise<string[]> {
    const indexUrl = 'https://www.gutenberg.org/dirs/GUTINDEX.ALL'
    const res = await fetch(indexUrl)
    await politeDelay()
    const text = await res.text()

    const ids: string[] = []

    const lines = text.split('\n')
    for (const line of lines) {
        const match = line.trim().match(/\d+$/)
        if (match) {
            ids.push(match[0])
        }
    }

    return [...new Set(ids)]
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