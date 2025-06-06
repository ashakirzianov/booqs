import { BooqFragment } from './fragment'
import { BooqId, BooqMeta, BooqMetaTag, BooqRange, TableOfContents } from './model'

export type AccountData = {
    id: string,
    joinedAt: string,
    name?: string,
    profilePictureURL?: string,
}
export type AccountDisplayData = Pick<AccountData, 'id' | 'name' | 'profilePictureURL'>
export type NoteColor = string // TODO: rename?
export type NoteData = {
    id: string,
    booqId: string,
    author: AccountDisplayData,
    range: BooqRange,
    color: string,
    content?: string,
    createdAt: string,
    updatedAt: string,
}
export type BooqNote = NoteData & {
    text: string,
    position?: number,
}
export type PartialBooqData = {
    id: BooqId,
    fragment: BooqFragment,
    meta: BooqMeta,
    toc: TableOfContents,
}
export type BooqLibraryCard = {
    id: BooqId,
    length: number,
    title?: string,
    authors: string[],
    languages: string[],
    subjects: string[],
    description?: string,
    coverUrl?: string,
    tags: BooqMetaTag[],
}
export type BooqCollection = {
    name: string,
    booqIds: BooqId[],
}
export type SearchResult = AuthorSearchResult | BooqSearchResult
export type AuthorSearchResult = {
    kind: 'author',
    author: {
        name: string,
    },
}
export type BooqSearchResult = {
    kind: 'book',
    card: BooqLibraryCard,
}