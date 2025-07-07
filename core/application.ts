import { BooqFragment } from './fragment'
import { BooqId, BooqMetadata, BooqRange, TableOfContents } from './model'

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
    booqId: BooqId,
    fragment: BooqFragment,
    meta: BooqMetadata,
    toc: TableOfContents,
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
    booqId: BooqId,
    title: string | undefined,
    authors: string[] | undefined,
    coverSrc: string | undefined,
}