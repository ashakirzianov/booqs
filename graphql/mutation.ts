import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { deleteUserForId, userForId, updateUser } from '@/backend/users'
import { addNote, removeNote, updateNote } from '@/backend/notes'
import { initiatePasskeyLogin, initiatePasskeyRegistration, verifyPasskeyLogin, verifyPasskeyRegistration } from '@/backend/passkey'
import { addToCollection, removeFromCollection } from '@/backend/collections'
import { addBooqHistory } from '@/backend/history'
import { addBookmark, deleteBookmark } from '@/backend/bookmarks'

export const mutationResolver: IResolvers<any, ResolverContext> = {
    Mutation: {
        signout(_, __, { clearAuth }) {
            clearAuth()
            return true
        },
        async deleteAccount(_, __, { userId, clearAuth }) {
            if (userId) {
                clearAuth()
                const result = await deleteUserForId(userId)
                return result
            } else {
                return false
            }
        },
        async addBookmark(_, { bookmark }, { userId }): Promise<boolean> {
            if (userId) {
                await addBookmark({
                    userId,
                    id: bookmark.id,
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
                return deleteBookmark(id)
            } else {
                return false
            }
        },
        async addNote(_, { note }, { userId }): Promise<boolean> {
            if (userId) {
                await addNote({
                    id: note.id,
                    authorId: userId,
                    booqId: note.booqId,
                    range: {
                        start: note.start,
                        end: note.end,
                    },
                    kind: note.kind,
                    targetQuote: note.targetQuote,
                })
                return true
            } else {
                return false
            }
        },
        async removeNote(_, { id }, { userId }) {
            if (userId) {
                return removeNote({
                    authorId: userId,
                    id: id,
                })
            } else {
                return false
            }
        },
        async updateNote(_, { id, kind }, { userId }): Promise<boolean> {
            if (userId) {
                await updateNote({
                    authorId: userId,
                    id: id,
                    kind,
                })
                return true
            } else {
                return false
            }
        },
        async addBooqHistory(_, { event }, { userId }): Promise<boolean> {
            if (userId) {
                await addBooqHistory(userId, {
                    booqId: event.booqId,
                    path: event.path,
                    date: Date.now(),
                })
                return true
            } else {
                return false
            }
        },
        async addToCollection(_, { booqId, name }, { userId }): Promise<boolean> {
            if (userId) {
                return addToCollection({
                    userId,
                    name, booqId,
                })
            } else {
                return false
            }
        },
        async removeFromCollection(_, { booqId, name }, { userId }): Promise<boolean> {
            if (userId) {
                return removeFromCollection({
                    userId,
                    name, booqId,
                })
            } else {
                return false
            }
        },
        async initPasskeyRegistration(_, __, { userId, origin }) {
            if (!userId) {
                return undefined
            }
            const user = await userForId(userId)
            if (!user) {
                return undefined
            }
            const result = await initiatePasskeyRegistration({ user, origin })
            if (result.success) {
                return {
                    id: result.id,
                    options: result.options,
                }
            } else {
                return undefined
            }
        },
        async verifyPasskeyRegistration(_, { id, response }, { setAuthForUserId, origin }) {
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
                setAuthForUserId(user.id)
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
        async verifyPasskeyLogin(_, { id, response }, { origin, setAuthForUserId }) {
            if (response) {
                const result = await verifyPasskeyLogin({
                    id, response, origin,
                })
                if (result.success) {
                    const user = result.user
                    setAuthForUserId(user.id)
                    return { user }
                }
            }

            return undefined
        },
        async updateUser(_, { input }, { userId }) {
            if (!userId) {
                return {
                    success: false,
                    user: null,
                    error: 'Authentication required'
                }
            }

            const result = await updateUser({
                id: userId,
                name: input.name,
                emoji: input.emoji,
                username: input.username
            })

            if (result.success) {
                return {
                    success: true,
                    user: result.user,
                    error: null,
                    field: null
                }
            } else {
                return {
                    success: false,
                    user: null,
                    error: result.reason,
                    field: result.field || null
                }
            }
        },
    },
}
