import { Booq, BooqId, BooqPath, pathToString, positionForPath, previewForPath, textForRange, contextForRange, BooqRange } from '@/core'
import { getExtraMetadataValues } from '@/core/meta'
import { ReadingContext } from '@/backend/ai'
import { redis } from './db'
import { parseEpubFile } from '@/parser'
import { fileForId } from './library'
import { inspect } from 'util'

export async function booqForId(booqId: BooqId, bypassCache = false): Promise<Booq | undefined> {
    if (bypassCache) {
        return parseBooqForId(booqId)
    }
    const cached = await redis.get<Booq>(`cache:booq:${booqId}`)
    if (cached) {
        return cached
    } else {
        const booq = await parseBooqForId(booqId)
        if (booq) {
            await redis.set(`cache:booq:${booqId}`, booq, {
                ex: 60 * 60 * 24,
            })
        }
        return booq
    }
}

export type BooqPreview = {
    booqId: BooqId,
    path: BooqPath,
    title?: string,
    text: string,
    length: number,
    position: number,
}
const PREVIEW_LENGTH = 500
export async function booqPreview(booqId: BooqId, path: BooqPath, end?: BooqPath): Promise<BooqPreview | undefined> {
    const key = `cache:booq:${booqId}:preview:${pathToString(path)}${end ? `:${pathToString(end)}` : ''}`
    const cached = await redis.get<BooqPreview>(key)
    if (cached) {
        return cached
    }
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }
    const full = end
        ? textForRange(booq.nodes, { start: path, end })
        : previewForPath(booq.nodes, path, PREVIEW_LENGTH)
    const text = full?.trim()?.substring(0, PREVIEW_LENGTH) ?? ''
    const position = positionForPath(booq.nodes, path)
    const length = booq.metadata.length
    const preview = {
        booqId,
        path,
        title: booq.metadata.title,
        text,
        position,
        length,
    }
    await redis.set(key, preview, { ex: 60 * 60 * 24 })
    return preview
}

async function parseBooqForId(booqId: BooqId) {
    const file = await fileForId(booqId)
    if (!file) {
        return undefined
    }
    const { value: booq, diags } = await parseEpubFile({
        fileBuffer: file.file,
    })
    diags.forEach(diag => {
        console.info(inspect(diag, { depth: 5, colors: true }))
    })
    return booq
}

export async function buildReadingContext(booqId: BooqId, range: BooqRange): Promise<ReadingContext | undefined> {
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }

    const text = textForRange(booq.nodes, range)
    if (!text) {
        return undefined
    }

    const context = contextForRange(booq.nodes, range, 4000) || text
    const languages = getExtraMetadataValues('language', booq.metadata.extra)

    return {
        text,
        context,
        title: booq.metadata.title,
        author: booq.metadata.authors[0]?.name,
        language: languages[0],
    }
}