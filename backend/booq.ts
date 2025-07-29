import { Booq, BooqId, BooqMetadata, BooqPath, pathToString, positionForPath, previewForPath, TableOfContents, textForRange } from '@/core'
import { getCachedValueForKey, cacheValueForKey } from './cache'
import { libraryCardForId } from './library'
import { loadBooqForId } from './load'

export async function booqForId(booqId: BooqId, bypassCache = false): Promise<Booq | undefined> {
    if (bypassCache) {
        return loadBooqForId(booqId)
    }
    const cached = await getCachedValueForKey<Booq>(`booq:${booqId}`)
    if (cached) {
        return cached
    } else {
        const booq = await loadBooqForId(booqId)
        if (booq) {
            await cacheValueForKey(`booq:${booqId}`, booq)
        }
        return booq
    }
}

export type BooqPreview = {
    position: number,
    text: string,
    title?: string,
    authors?: string[],
    coverSrc?: string,
    booqLength: number,
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
    const authors = booq.metadata.authors.map(author => author.name)
    const booqLength = booq.metadata.length
    const preview = {
        position,
        text,
        title: booq.metadata.title,
        authors,
        coverSrc: booq.metadata.coverSrc,
        booqLength,
    }
    await cacheValueForKey(key, preview, 60 * 60) // Cache for 1 hour
    return preview
}

export async function booqMetadata(booqId: BooqId): Promise<BooqMetadata | undefined> {
    const card = await libraryCardForId(booqId)
    if (!card) {
        return undefined
    }
    return card.meta
}

export async function booqToc(booqId: BooqId): Promise<TableOfContents | undefined> {
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }
    return booq.toc
}

