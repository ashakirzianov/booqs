import { BooqId, BooqMetadata, InLibraryId, LibraryId, makeId, parseId } from '@/core'
import groupBy from 'lodash-es/groupBy'
import { pgLibrary } from './pg'
import { userUploadsLibrary } from './uu'
import { localLibrary } from './lo'

export type BooqLibraryCard = {
    booqId: BooqId,
    meta: BooqMetadata,
}

export type LibrarySearchResult =
    | AuthorSearchResult
    | BooqSearchResult

export type AuthorSearchResult = {
    kind: 'author',
    name: string,
}

export type BooqSearchResult = {
    kind: 'booq',
    booqId: BooqId,
    meta: BooqMetadata,
}

export type InLibraryCard = {
    id: InLibraryId,
    meta: BooqMetadata,
}
export type BookFile = {
    kind: 'epub',
    file: Buffer,
}

export type Library = {
    search(query: string, limit: number): Promise<InLibraryCard[]>,
    cards(ids: InLibraryId[]): Promise<InLibraryCard[]>,
    forAuthor(author: string, limit?: number, offset?: number): Promise<InLibraryCard[]>,
    fileForId(id: string): Promise<BookFile | undefined>,
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

export async function libraryCardsForIds(ids: string[]): Promise<Array<BooqLibraryCard | undefined>> {
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

export async function booqsForAuthor(author: string, limit?: number, offset?: number): Promise<BooqLibraryCard[]> {
    const supported: Array<keyof typeof libraries> = ['pg']
    const results = await Promise.all(
        supported.map(
            library => libraries[library]!.forAuthor(author, limit, offset)
                .then(cards => cards.map(card => ({
                    booqId: makeId(library, card.id),
                    meta: card.meta,
                }))),
        ),
    )
    return results.flat()
}

export async function searchBooqs(query: string, limit: number): Promise<LibrarySearchResult[]> {
    if (!query) {
        return []
    }
    const cards = Object.entries(libraries).map(
        async ([prefix, library]): Promise<LibrarySearchResult[]> => {
            if (library) {
                const results = await library.search(query, limit)
                return results.map(result => ({
                    kind: 'booq',
                    booqId: makeId(prefix, result.id),
                    meta: result.meta,
                }))
            } else {
                return []
            }
        },
    )

    const all = await Promise.all(cards)
    return all.flat()
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