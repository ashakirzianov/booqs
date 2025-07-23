import { Booq, BooqId, BooqPath, pathToString, positionForPath, previewForPath, textForRange } from '@/core'
import { getCachedValueForKey, cacheValueForKey } from './cache'
import { parseEpubFile } from '@/parser'
import { fileForId } from './library'
import { inspect } from 'util'

export async function booqForId(booqId: BooqId, bypassCache = false): Promise<Booq | undefined> {
    if (bypassCache) {
        return parseBooqForId(booqId)
    }
    const cached = await getCachedValueForKey<Booq>(`booq:${booqId}`)
    if (cached) {
        return cached
    } else {
        const booq = await parseBooqForId(booqId)
        if (booq) {
            await cacheValueForKey(`booq:${booqId}`, booq)
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
    const key = `booq:${booqId}:preview:${pathToString(path)}${end ? `:${pathToString(end)}` : ''}`
    const cached = await getCachedValueForKey<BooqPreview>(key)
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
    await cacheValueForKey(key, preview)
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

