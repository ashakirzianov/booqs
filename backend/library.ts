import { AuthorSearchResult, BooqLibraryCard, BooqSearchResult, filterUndefined, InLibraryId, LibraryId, makeId, parseId, SearchResult } from '@/core'
import groupBy from 'lodash-es/groupBy'
import { Booq } from '../core'
import { pgLibrary } from './pg'
import { uploadBooqImages } from './images'
import { userUploadsLibrary } from './uu'
import { localLibrary } from './lo'

export type InLibraryCard = Omit<BooqLibraryCard, 'id'> & {
    id: InLibraryId,
}
export type BookFile = {
    kind: 'epub',
    file: Buffer,
}
export type InLibrarySearchResult = AuthorSearchResult
    | Omit<BooqSearchResult, 'card'> & {
        card: InLibraryCard,
    }
export type Library = {
    search(query: string, limit: number): Promise<InLibrarySearchResult[]>,
    cards(ids: InLibraryId[]): Promise<InLibraryCard[]>,
    forAuthor(author: string, limit?: number, offset?: number): Promise<InLibraryCard[]>,
    fileForId(id: string): Promise<BookFile | undefined>,
    uploadEpub?(fileBuffer: Buffer, userId: string): Promise<{
        card: InLibraryCard,
        booq?: Booq,
    } | undefined>,
    deleteAllBooksForUserId?(userId: string): Promise<boolean>,
}

const libraries: {
    [prefix in LibraryId]?: Library;
} = {
    pg: pgLibrary,
    uu: userUploadsLibrary,
    lo: localLibrary,
}

export function processCard(prefix: string) {
    return (card: InLibraryCard) => ({
        ...card,
        id: makeId(prefix, card.id),
    })
}

export async function libraryCardForId(id: string) {
    const [result] = await libraryCardsForIds([id])
    return result
}

export async function libraryCardsForIds(ids: string[]): Promise<Array<BooqLibraryCard | undefined>> {
    const parsed = filterUndefined(
        ids.map(idString => {
            const [library, id] = parseId(idString)
            return library && id
                ? { library, id }
                : undefined
        }),
    )
    const grouped = groupBy(
        parsed,
        id => id.library,
    )
    const groupedResults = Object.entries(grouped).map(async ([libraryPrefix, pids]) => {
        const library = libraries[libraryPrefix]
        if (library) {
            const forLibrary = await library.cards(pids.map(p => p.id))
            return forLibrary.map(processCard(libraryPrefix))
        } else {
            return undefined
        }
    })
    const results = filterUndefined(await Promise.all(groupedResults))
        .flat()
    return ids.map(
        id => results.find(r => r.id === id),
    )
}

export async function booqsForAuthor(author: string, limit?: number, offset?: number) {
    const supported: Array<keyof typeof libraries> = ['pg']
    const results = await Promise.all(
        supported.map(
            library => libraries[library]!.forAuthor(author, limit, offset)
                .then(cards => cards.map(processCard(library))),
        ),
    )
    return results.flat()
}

export async function uploadToLibrary(libraryPrefix: string, fileBuffer: Buffer, userId: string) {
    const uploadEpub = libraries[libraryPrefix]?.uploadEpub
    if (uploadEpub) {
        const result = await uploadEpub(fileBuffer, userId)
        if (result) {
            if (result.booq) {
                const imageResults = await uploadBooqImages(`${libraryPrefix}/${result.card.id}`, result.booq)
                for (const imageResult of imageResults) {
                    if (!imageResult.success) {
                        console.warn(`Failed to upload image ${imageResult.id} for ${libraryPrefix}/${result.card.id}`)
                    }
                }
            }
            return processCard(libraryPrefix)(result.card)
        }
    }
    return undefined
}

export async function searchBooqs(query: string, limit: number): Promise<SearchResult[]> {
    if (!query) {
        return []
    }
    const cards = Object.entries(libraries).map(
        async ([prefix, library]) => {
            if (library) {
                const results = await library.search(query, limit)
                return results.map(processSearchResult(prefix))
            } else {
                return []
            }
        },
    )

    const all = await Promise.all(cards)
    return all.flat()
}

export async function fileForId(booqId: string) {
    const [prefix, id] = parseId(booqId)
    const library = libraries[prefix]
    return library && id
        ? library.fileForId(id)
        : undefined
}

function processSearchResult(prefix: string) {
    const cardProcessor = processCard(prefix)
    return function (result: InLibrarySearchResult): SearchResult {
        if (result.kind === 'book') {
            return {
                ...result,
                card: cardProcessor(result.card),
            }
        } else {
            return result
        }
    }
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