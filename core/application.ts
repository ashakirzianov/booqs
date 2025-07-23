import { BooqFragment } from './fragment'
import { BooqId, BooqMetadata, BooqRange, TableOfContents } from './model'

export type AccountPublicData = {
    id: string,
    username: string,
    joinedAt: string,
    name: string,
    profilePictureURL?: string,
    emoji: string,
}

export type AccountData = AccountPublicData & {
    email: string,
}
export type AuthorData = Pick<AccountData, 'id' | 'username' | 'name' | 'profilePictureURL' | 'emoji'>
export type NoteColor = string // TODO: rename?
export type NotePrivacy = 'private' | 'public'

export type BooqNote = {
    id: string,
    booqId: BooqId,
    author: AuthorData,
    range: BooqRange,
    kind: string,
    content?: string,
    targetQuote: string,
    privacy: NotePrivacy,
    createdAt: string,
    updatedAt: string,
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