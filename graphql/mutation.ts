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
        async deleteAccount(_, __, { userId, setAuthToken }) {
            if (userId) {
                setAuthToken(undefined)
                const result = await deleteUserForId(userId)
                return result
            } else {
                return false
            }
        },
        async addBookmark(_, { bookmark }, { userId }) {
            if (userId) {
                await addBookmark({
                    userId,
                    booqId: bookmark.booqId,
                    path: bookmark.path,
                })
                return true
            } else {
                return false
            }
        },
        async removeBookmark(_, { id }, { userId }) {
            if (userId) {
                await deleteBookmark(id)
                return true
            } else {
                return false
            }
        },
        async addHighlight(_, { highlight }, { userId }) {
            if (userId) {
                await addHighlight({
                    userId: userId,
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
        async removeHighlight(_, { id }, { userId }) {
            if (userId) {
                await removeHighlight({
                    userId,
                    id: id,
                })
                return true
            } else {
                return false
            }
        },
        async updateHighlight(_, { id, color }, { userId }) {
            if (userId) {
                await updateHighlight({
                    userId,
                    id: id,
                    color,
                })
                return true
            } else {
                return false
            }
        },
        async addBooqHistory(_, { event }, { userId }) {
            if (userId) {
                await addBooqHistory(userId, {
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
        async addToCollection(_, { booqId, name }, { userId }) {
            if (userId) {
                await addToCollection({
                    userId,
                    name, booqId,
                })
                return true
            } else {
                return false
            }
        },
        async removeFromCollection(_, { booqId, name }, { userId }) {
            if (userId) {
                await removeFromCollection({
                    userId,
                    name, booqId,
                })
                return true
            } else {
                return false
            }
        },
        async initPasskeyRegistration(_, __, { origin }) {
            const result = await initiatePasskeyRegistration({ origin })
            if (result.success) {
                return {
                    id: result.id,
                    options: result.options,
                }
            } else {
                return undefined
            }
        },
        async verifyPasskeyRegistration(_, { id, response }, { setAuthToken, origin }) {
            if (!id || !response) {
                return undefined
            }
            const result = await verifyPasskeyRegistration({
                id,
                response,
                origin,
            })
            if (result.success) {
                const user = result.user
                const token = generateToken(user.id)
                setAuthToken(token)
                return { user }
            }
            return undefined
        },
        async initPasskeyLogin(_, __, { origin }) {
            const result = await initiatePasskeyLogin({
                origin,
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
        async verifyPasskeyLogin(_, { id, response }, { origin, setAuthToken }) {
            if (response) {
                const result = await verifyPasskeyLogin({
                    id, response, origin,
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
