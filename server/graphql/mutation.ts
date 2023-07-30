import { IResolvers } from '@graphql-tools/utils'
import { uniqueId } from '../../core'
import { users } from '../users'
import { highlights } from '../highlights'
import { ResolverContext } from './context'

export const mutationResolver: IResolvers<any, ResolverContext> = {
    Mutation: {
        async addBookmark(_, { bookmark }, { user }) {
            if (user?._id) {
                return users.addBookmark(
                    user._id,
                    {
                        id: bookmark.id ?? uniqueId(),
                        booqId: bookmark.booqId,
                        path: bookmark.path,
                    })
            } else {
                return false
            }
        },
        async removeBookmark(_, { id }, { user }) {
            if (user?._id) {
                return users.deleteBookmark(
                    user._id,
                    { id },
                )
            } else {
                return false
            }
        },
        async addHighlight(_, { highlight }, { user }) {
            if (user?._id) {
                return highlights.add({
                    userId: user._id,
                    id: highlight.id,
                    booqId: highlight.booqId,
                    start: highlight.start,
                    end: highlight.end,
                    group: highlight.group,
                })
            } else {
                return false
            }
        },
        async removeHighlight(_, { id }, { user }) {
            if (user?._id) {
                return highlights.remove({
                    userId: user._id,
                    id: id,
                })
            } else {
                return false
            }
        },
        async updateHighlight(_, { id, group }, { user }) {
            if (user?._id) {
                return highlights.update({
                    userId: user._id,
                    id: id,
                    group,
                })
            } else {
                return false
            }
        },
        async addBooqHistory(_, { event }, { user }) {
            if (user?._id) {
                return users.addBooqHistory(
                    user._id,
                    {
                        booqId: event.booqId,
                        path: event.path,
                        source: event.source,
                        date: new Date(Date.now()),
                    })
            } else {
                return false
            }
        },
        async removeBooqHistory(_, { booqId }, { user }) {
            if (user?._id) {
                return users.deleteBooqHistory(
                    user._id,
                    { booqId },
                )
            } else {
                return false
            }
        },
        async addToCollection(_, { booqId, name }, { user }) {
            if (user?._id) {
                return users.addToCollection(
                    user._id,
                    name,
                    booqId,
                )
            } else {
                return false
            }
        },
        async removeFromCollection(_, { booqId, name }, { user }) {
            if (user?._id) {
                return users.removeFromCollection(
                    user._id,
                    name,
                    booqId,
                )
            } else {
                return false
            }
        },
    },
}