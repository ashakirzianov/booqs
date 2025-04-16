import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { deleteUserForId } from '@/backend/users'
import { addHighlight, removeHighlight, updateHighlight } from '@/backend/highlights'
import { initiatePasskeyLogin, initiatePasskeyRegistration, verifyPasskeyLogin, verifyPasskeyRegistration } from '@/backend/passkey'
import { generateToken } from '@/backend/token'
import { addToCollection, removeFromCollection } from '@/backend/collections'
import { addBooqHistory } from '@/backend/history'
import { addBookmark, deleteBookmark } from '@/backend/bookmarks'

export const mutationResolver: IResolvers<any, ResolverContext> = {
    Mutation: {
        signout(_, __, { setAuthToken }) {
            setAuthToken(undefined)
            return true
        },
        async deleteAccount(_, __, { user, setAuthToken }) {
            if (user?._id) {
                setAuthToken(undefined)
                const result = await deleteUserForId(user._id)
                return result
            } else {
                return false
            }
        },
        async addBookmark(_, { bookmark }, { user }) {
            if (user?._id) {
                return addBookmark({
                    userId: user.id,
                    booqId: bookmark.booqId,
                    path: bookmark.path,
                })
            } else {
                return false
            }
        },
        async removeBookmark(_, { id }, { user }) {
            if (user?._id) {
                return deleteBookmark(id)
            } else {
                return false
            }
        },
        async addHighlight(_, { highlight }, { user }) {
            if (user?._id) {
                return addHighlight({
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
                return removeHighlight({
                    userId: user._id,
                    id: id,
                })
            } else {
                return false
            }
        },
        async updateHighlight(_, { id, group }, { user }) {
            if (user?._id) {
                return updateHighlight({
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
                return addBooqHistory(
                    user._id,
                    {
                        booqId: event.booqId,
                        path: event.path,
                        source: event.source,
                        date: Date.now(),
                    })
            } else {
                return false
            }
        },
        async addToCollection(_, { booqId, name }, { user }) {
            if (user?._id) {
                return addToCollection({
                    userId: user.id,
                    name, booqId,
                })
            } else {
                return false
            }
        },
        async removeFromCollection(_, { booqId, name }, { user }) {
            if (user?._id) {
                return removeFromCollection({
                    userId: user.id,
                    name, booqId,
                })
            } else {
                return false
            }
        },
        async initPasskeyRegistration(_, __, { requestOrigin }) {
            const result = await initiatePasskeyRegistration({ requestOrigin })
            if (result.success) {
                return {
                    id: result.id,
                    options: result.options,
                }
            } else {
                return undefined
            }
        },
        async verifyPasskeyRegistration(_, { id, response }, { setAuthToken, requestOrigin }) {
            if (!id || !response) {
                return undefined
            }
            const result = await verifyPasskeyRegistration({
                id,
                response,
                requestOrigin,
            })
            if (result.success) {
                const user = result.user
                const token = generateToken(user.id)
                setAuthToken(token)
                return { user }
            }
            return undefined
        },
        async initPasskeyLogin(_, __, { requestOrigin }) {
            const result = await initiatePasskeyLogin({
                requestOrigin,
            })
            if (result.success) {
                return {
                    id: result.id,
                    options: result.options,
                }
            } else {
                return undefined
            }
        },
        async verifyPasskeyLogin(_, { id, response }, { requestOrigin, setAuthToken }) {
            if (response) {
                const result = await verifyPasskeyLogin({
                    id, response, requestOrigin,
                })
                if (result.success) {
                    const user = result.user
                    const token = generateToken(user.id)
                    setAuthToken(token)
                    return { user }
                }
            }

            return undefined
        },
    },
}
