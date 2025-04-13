import { filterUndefined, makeId, parseId } from '@/core'
import { groupBy } from 'lodash'
import { Booq } from '../core'
import { pgSource } from './pg'

export type LibraryCard = {
    id: string,
    length: number,
    title?: string,
    author?: string,
    language?: string,
    description?: string,
    subjects?: string[],
    cover?: string,
}
export type BookFile = {
    kind: 'epub',
    file: Buffer,
}
export type SearchScope = 'title' | 'author' | 'subject'
export type SearchResult = {
    kind: 'author',
    author: {
        name: string,
    },
} | {
    kind: 'book',
    card: LibraryCard,
}
export type LibrarySource = {
    search(query: string, limit: number, scope: SearchScope[]): Promise<SearchResult[]>,
    cards(ids: string[]): Promise<LibraryCard[]>,
    forAuthor(author: string, limit?: number, offset?: number): Promise<LibraryCard[]>,
    fileForId(id: string): Promise<BookFile | undefined>,
    uploadEpub?(fileBuffer: Buffer, userId: string): Promise<{
        card: LibraryCard,
        booq?: Booq,
    } | undefined>,
    deleteAllBooksForUserId?(userId: string): Promise<boolean>,
}

const sources: {
    [prefix in string]?: LibrarySource;
} = {
    pg: pgSource,
    // uu: uuSource,
    // lo: localBooqs,
}

export function processCard(prefix: string) {
    return (card: LibraryCard) => ({
        ...card,
        id: makeId(prefix, card.id),
    })
}

export async function forIds(ids: string[]): Promise<Array<LibraryCard | undefined>> {
    const parsed = filterUndefined(
        ids.map(idString => {
            const [source, id] = parseId(idString)
            return source && id
                ? { source, id }
                : undefined
        }),
    )
    const grouped = groupBy(
        parsed,
        id => id.source,
    )
    const groupedResults = Object.entries(grouped).map(async ([sourcePrefix, pids]) => {
        const source = sources[sourcePrefix]
        if (source) {
            const forSource = await source.cards(pids.map(p => p.id))
            return forSource.map(processCard(sourcePrefix))
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