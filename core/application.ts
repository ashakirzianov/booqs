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
export type NotePrivacy = 'private' | 'public'

export type NoteData = {
    id: string,
    booqId: BooqId,
    author: AccountDisplayData,
    range: BooqRange,
    color: string,
    content?: string,
    privacy: NotePrivacy,
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