import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { ResolverContext } from './context'
import { DbBookmark } from '@/backend/bookmarks'
import { BooqId } from '@/core'

export type BookmarkParent = DbBookmark
export const bookmarkResolver: IResolvers<BookmarkParent, ResolverContext> = {
    Bookmark: {
        async booq(parent, _, { booqDataLoader }): Promise<BooqParent | undefined> {
            return booqDataLoader.load(parent.booq_id as BooqId)
        },
    },
}
