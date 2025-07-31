import { IResolvers } from '@graphql-tools/utils'
import { booqDataForId } from '@/backend/library'
import { BooqParent } from './booq'
import { DbBookmark } from '@/backend/bookmarks'
import { BooqId } from '@/core'

export type BookmarkParent = DbBookmark
export const bookmarkResolver: IResolvers<BookmarkParent> = {
    Bookmark: {
        async booq(parent): Promise<BooqParent | undefined> {
            return booqDataForId(parent.booq_id as BooqId)
        },
    },
}
