import {
    Booq, BooqId, BooqMetadata, BooqPath, InLibraryId, LibraryId, pathToString, positionForPath, previewForPath, TableOfContents, textForRange, BooqRange, nodesForRange, BooqNode,
    parseId,
} from '@/core'
import { getCachedValueForKey, cacheValueForKey } from './cache'
import { downloadAsset, uploadAsset } from './blob'
import { parseAndLoadImagesFromFile, parseAndPreprocessBooq } from './parse'
import groupBy from 'lodash-es/groupBy'
import { pgLibrary } from './pg'
import { userUploadsLibrary } from './uu'
import { localLibrary } from './lo'
import { getExtraMetadataValues } from '@/core/meta'
import { BooqImages } from './images'

export type BooqData = {
    booqId: BooqId,
    title: string,
    authors: string[],
    subjects: string[] | undefined,
    languages: string[] | undefined,
    coverSrc: string | undefined,
}

export type BooqFile = {
    kind: 'epub',
    file: Buffer,
}
export type InLibraryCard = {
    id: InLibraryId,
    meta: BooqMetadata,
}

export type LibraryQuery = {
    kind: 'search' | 'author' | 'subject' | 'language',
    query: string,
    limit: number,
    offset?: number,
}
export type InLibraryQueryResult = {
    cards: InLibraryCard[],
    hasMore: boolean,
    total?: number,
}

export type Library = {
    query(query: LibraryQuery): Promise<InLibraryQueryResult>,
    cards(ids: InLibraryId[]): Promise<InLibraryCard[]>,
    fileForId(id: string): Promise<BooqFile | undefined>,
}

const libraries: {
    [prefix in LibraryId]?: Library;
} = {
    pg: pgLibrary,
    uu: userUploadsLibrary,
    lo: localLibrary,
}

const CACHE_BUCKET = 'booqs-cache'

export async function booqForId(booqId: BooqId): Promise<Booq | undefined> {
    const cached = await getCachedBooq(booqId)
    if (cached) {
        return cached
    }
    const file = await booqFileForId(booqId)
    if (!file) {
        return undefined
    }
    const booq = await parseAndPreprocessBooq(booqId, file)
    if (booq) {
        cacheBooq(booqId, booq).catch(e =>
            console.warn(`Failed to cache booq ${booqId}:`, e instanceof Error ? e.message : e)
        )
    }
    return booq
}

async function getCachedBooq(booqId: BooqId): Promise<Booq | undefined> {
    const buffer = await downloadAsset(CACHE_BUCKET, `booqs/${booqId}.json`)
    if (!buffer) {
        return undefined
    }
    try {
        return JSON.parse(buffer.toString('utf-8'))
    } catch {
        return undefined
    }
}

async function cacheBooq(booqId: BooqId, booq: Booq): Promise<void> {
    const json = JSON.stringify(booq)
    await uploadAsset(CACHE_BUCKET, `booqs/${booqId}.json`, Buffer.from(json, 'utf-8'))
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
    const preview: BooqPreview = {
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

export async function booqDataForIds(ids: BooqId[]): Promise<Array<BooqData | undefined>> {
    const parsed = ids
        .map(idString => {
            const [library, id] = parseId(idString)
            return { library, id }
        })
        .filter(p => p !== undefined)
    const grouped = groupBy(
        parsed,
        id => id.library,
    )
    const groupedResults = Object.entries(grouped).map(async ([libraryPrefix, pids]) => {
        const library = libraries[libraryPrefix]
        if (library) {
            const forLibrary = await library.cards(pids.map(p => p.id))
            const cards = await Promise.all(forLibrary.map(async card => {
                return buildBooqData({
                    booqId: `${libraryPrefix}-${card.id}`,
                    meta: card.meta,
                })
            }))
            return cards
        } else {
            return undefined
        }
    })
    const results = (await Promise.all(groupedResults))
        .flat()
        .filter(r => r !== undefined)
    return ids.map(
        id => results.find(r => r.booqId === id),
    )
}

export async function booqDataForId(booqId: BooqId): Promise<BooqData | undefined> {
    const [card] = await booqDataForIds([booqId])
    return card
}

export async function booqToc(booqId: BooqId): Promise<TableOfContents | undefined> {
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }
    return booq.toc
}

export async function booqQuery(libraryId: string, query: LibraryQuery): Promise<{
    cards: BooqData[],
    hasMore: boolean,
    total?: number,
}> {
    const library = libraries[libraryId]
    if (!library) {
        throw new Error(`Library with id ${libraryId} not found`)
    }
    const result = await library.query(query)
    const cards = await Promise.all(result.cards.map(card => {
        return buildBooqData({
            booqId: `${libraryId}-${card.id}`,
            meta: card.meta,
        })
    }))
    return {
        cards,
        hasMore: result.hasMore,
        total: result.total,
    }
}

export async function featuredBooqIds(_limit?: number): Promise<BooqId[]> {
    return [
        'pg-55201',
        'pg-1635',
        'pg-3207',
        'pg-2680',
        'pg-11',
        'pg-1661',
        'pg-98',
        'pg-174',
        'pg-844',
        'pg-203',
        'pg-28054',
        'pg-5740',
        'pg-135',
        'pg-1727',
        'pg-4363',
    ]
}

async function buildBooqData({
    booqId,
    meta: { coverSrc, title, authors, extra },
}: {
    booqId: BooqId,
    meta: BooqMetadata,
}): Promise<BooqData> {
    return {
        booqId,
        title,
        authors: authors.map(author => author.name),
        subjects: getExtraMetadataValues('subject', extra),
        languages: getExtraMetadataValues('language', extra),
        coverSrc,
    }
}

export async function booqFragmentForRange(booqId: BooqId, range: BooqRange): Promise<{ nodes: BooqNode[] } | undefined> {
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }

    const nodes = nodesForRange(booq.nodes, range, true)

    return { nodes }
}

export async function booqImages(booqId: BooqId): Promise<BooqImages | undefined> {
    const file = await booqFileForId(booqId)
    if (!file) {
        return undefined
    }
    const booqImages = await parseAndLoadImagesFromFile(file)
    if (!booqImages) {
        return undefined
    }
    return booqImages
}

async function booqFileForId(booqId: BooqId) {
    const [prefix, id] = parseId(booqId)
    const library = libraries[prefix]
    return library && id
        ? library.fileForId(id)
        : undefined
}

