import { BooqFragment } from './fragment'
import { BooqId, BooqMeta, BooqRange, TableOfContents } from './model'

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
    booqId: BooqId,
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
    length: number,
}
export type BooqLibraryCard = BooqMeta & {
    id: BooqId,
    length: number,
}
export type BooqCollection = {
    name: string,
    booqIds: BooqId[],
}
export type SearchResult = AuthorSearchResult | BooqSearchResult
export type AuthorSearchResult = {
    kind: 'author',
    name: string,
}
export type BooqSearchResult = {
    kind: 'booq',
    id: BooqId,
    title: string | undefined,
    authors: string[] | undefined,
    coverSrc: string | undefined,
}