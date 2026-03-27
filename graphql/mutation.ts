import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { deleteUserForId, updateUser, userForUsername } from '@/backend/users'
import { addNote, removeNote, updateNote } from '@/backend/notes'
import { initiatePasskeyLogin, initiatePasskeyRegistration, verifyPasskeyLogin, verifyPasskeyRegistration } from '@/backend/passkey'
import { initiateSignRequest, completeSignInRequest, completeSignUp } from '@/backend/sign'
import { generateToken } from '@/backend/token'
import { addToCollection, removeFromCollection } from '@/backend/collections'
import { addBooqHistory, removeBooqHistory } from '@/backend/history'
import { addBookmark, deleteBookmark } from '@/backend/bookmarks'
import { followUser, unfollowUser } from '@/backend/follows'
import { deletePasskeyCredential } from '@/backend/passkey'
import { requestUpload, confirmUpload } from '@/backend/uu'

export const mutationResolver: IResolvers<any, ResolverContext> = {
    Mutation: {
        async follow(_, { username }, { userId }): Promise<boolean> {
            if (!userId) {
                return false
            }
            const target = await userForUsername(username)
            if (!target) {
                return false
            }
            return followUser(userId, target.id)
        },
        async unfollow(_, { username }, { userId }): Promise<boolean> {
            if (!userId) {
                return false
            }
            const target = await userForUsername(username)
            if (!target) {
                return false
            }
            return unfollowUser(userId, target.id)
        },
        async removeHistory(_, { booqId }, { userId }): Promise<boolean> {
            if (!userId) {
                return false
            }
            return removeBooqHistory(userId, booqId)
        },
        signout(_, __, { clearAuth }) {
            clearAuth()
            return true
        },
        async deletePasskey(_, { id }: { id: string }, { userId }) {
            if (!userId) {
                return false
            }
            return deletePasskeyCredential(userId, id)
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
        async updateNote(_, { id, kind, content }, { userId }): Promise<boolean> {
            if (userId) {
                await updateNote({
                    authorId: userId,
                    id: id,
                    kind,
                    content,
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
        async initiateSign(_, { email, returnTo }: { email: string, returnTo?: string }) {
            const result = await initiateSignRequest({
                email,
                from: returnTo ?? '/',
            })
            return result.kind !== 'error'
        },
        async completeSignIn(_, { email, secret }: { email: string, secret: string }, { setAuthForUserId }) {
            const result = await completeSignInRequest({ email, secret })
            if (!result.success) {
                return undefined
            }
            const token = generateToken(result.user.id)
            setAuthForUserId(result.user.id)
            return { token, user: result.user }
        },
        async completeSignUp(_, { email, secret, username, name, emoji }: {
            email: string, secret: string, username: string, name: string, emoji: string,
        }, { setAuthForUserId }) {
            const result = await completeSignUp({ email, secret, username, name, emoji })
            if (!result.success) {
                return undefined
            }
            const token = generateToken(result.user.id)
            setAuthForUserId(result.user.id)
            return { token, user: result.user }
        },
        async initPasskeyRegistration(_, __, { userId, origin, userLoader }) {
            if (!userId) {
                return undefined
            }
            const user = await userLoader.load(userId)
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
        async requestUpload(_, __, { userId }) {
            if (!userId) {
                return null
            }
            return requestUpload()
        },
        async confirmUpload(_, { uploadId }: { uploadId: string }, { userId }) {
            if (!userId) {
                return { success: false, error: 'Authentication required' }
            }
            return confirmUpload(uploadId, userId)
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
