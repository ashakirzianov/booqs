import { BooqId, BooqMetadata, InLibraryId, LibraryId, makeId, parseId } from '@/core'
import groupBy from 'lodash-es/groupBy'
import { pgLibrary } from './pg'
import { userUploadsLibrary } from './uu'
import { localLibrary } from './lo'

export type LibraryCard = {
    booqId: BooqId,
    meta: BooqMetadata,
}

export type InLibraryCard = {
    id: InLibraryId,
    meta: BooqMetadata,
}
export type BooqFile = {
    kind: 'epub',
    file: Buffer,
}

export type LibraryQuery = {
    kind: 'search',
    query: string,
    limit: number,
    offset?: number,
}
export type InLibraryQueryResult = {
    cards: InLibraryCard[],
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

export async function libraryCardForId(id: string) {
    const [result] = await libraryCardsForIds([id])
    return result
}

export async function libraryCardsForIds(ids: string[]): Promise<Array<LibraryCard | undefined>> {
    const parsed = ids
        .map(idString => {
            const [library, id] = parseId(idString)
            return library && id
                ? { library, id }
                : undefined
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
            return forLibrary.map(card => ({
                booqId: makeId(libraryPrefix, card.id),
                meta: card.meta,
            }))
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

export async function queryLibrary(libraryId: string, query: LibraryQuery): Promise<{
    cards: LibraryCard[],
}> {
    const library = libraries[libraryId]
    if (!library) {
        throw new Error(`Library with id ${libraryId} not found`)
    }
    const results = await library.query(query)
    const cards = results.cards.map(card => ({
        booqId: makeId(libraryId, card.id),
        meta: card.meta,
    }))
    return {
        cards,
    }
}

export async function fileForId(booqId: BooqId) {
    const [prefix, id] = parseId(booqId)
    const library = libraries[prefix]
    return library && id
        ? library.fileForId(id)
        : undefined
}

export async function featuredBooqIds(_limit?: number) {
    return [
        'pg/55201',
        'pg/1635',
        'pg/3207',
        'pg/2680',
        'pg/11',
        'pg/1661',
        'pg/98',
        'pg/174',
        'pg/844',
        'pg/203',
        'pg/28054',
        'pg/5740',
        'pg/135',
        'pg/1727',
        'pg/4363',
    ]
}