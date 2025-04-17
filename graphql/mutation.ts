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
            if (user?.id) {
                setAuthToken(undefined)
                const result = await deleteUserForId(user.id)
                return result
            } else {
                return false
            }
        },
        async addBookmark(_, { bookmark }, { user }) {
            if (user?.id) {
                await addBookmark({
                    userId: user.id,
                    booqId: bookmark.booqId,
                    path: bookmark.path,
                })
                return true
            } else {
                return false
            }
        },
        async removeBookmark(_, { id }, { user }) {
            if (user?.id) {
                await deleteBookmark(id)
                return true
            } else {
                return false
            }
        },
        async addHighlight(_, { highlight }, { user }) {
            if (user?.id) {
                await addHighlight({
                    userId: user.id,
                    booqId: highlight.booqId,
                    range: {
                        start: highlight.start,
                        end: highlight.end,
                    },
                    color: highlight.color,
                })
                return true
            } else {
                return false
            }
        },
        async removeHighlight(_, { id }, { user }) {
            if (user?.id) {
                await removeHighlight({
                    userId: user.id,
                    id: id,
                })
                return true
            } else {
                return false
            }
        },
        async updateHighlight(_, { id, color }, { user }) {
            if (user?.id) {
                await updateHighlight({
                    userId: user.id,
                    id: id,
                    color,
                })
                return true
            } else {
                return false
            }
        },
        async addBooqHistory(_, { event }, { user }) {
            if (user?.id) {
                await addBooqHistory(user.id, {
                    booqId: event.booqId,
                    path: event.path,
                    source: event.source,
                    date: Date.now(),
                })
                return true
            } else {
                return false
            }
        },
        async addToCollection(_, { booqId, name }, { user }) {
            if (user?.id) {
                await addToCollection({
                    userId: user.id,
                    name, booqId,
                })
                return true
            } else {
                return false
            }
        },
        async removeFromCollection(_, { booqId, name }, { user }) {
            if (user?.id) {
                await removeFromCollection({
                    userId: user.id,
                    name, booqId,
                })
                return true
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
