import { BooqId } from '@/core'
import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { deleteUserForId, updateUser, userForUsername } from '@/backend/users'
import { addNote, removeNote, updateNote } from '@/backend/notes'
import { addReply, removeReply, updateReply } from '@/backend/replies'
import { initiatePasskeyLogin, initiatePasskeyRegistration, verifyPasskeyLogin, verifyPasskeyRegistration } from '@/backend/passkey'
import { initiateSignRequest, completeSignInRequest, completeSignUp } from '@/backend/sign'
import { generateAccessToken } from '@/backend/token'
import { addToCollection, removeFromCollection } from '@/backend/collections'
import { addBooqHistory, removeBooqHistory } from '@/backend/history'
import { addBookmark, deleteBookmark } from '@/backend/bookmarks'
import { followUser, unfollowUser } from '@/backend/follows'
import { deletePasskeyCredential } from '@/backend/passkey'
import { requestUpload, confirmUpload } from '@/backend/uu'
import { primeAfterUpload } from '@/backend/library'
import { extractAndUploadMissingOriginals } from '@/backend/variants'
import { setCachedBooqFile } from '@/backend/cache'
import { after } from 'next/server'

type MutationResult = { success: boolean, error?: string }
type UploadResult = {
    success: boolean,
    booqId?: BooqId,
    title?: string,
    coverSrc?: string,
    error?: string
}

function ok(): MutationResult {
    return { success: true }
}

function fail(error: string): MutationResult {
    return { success: false, error }
}

function requireAuth(userId: string | undefined): userId is string {
    return userId !== undefined
}

export const mutationResolver: IResolvers<any, ResolverContext> = {
    Mutation: {
        async follow(_, { username }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const target = await userForUsername(username)
            if (!target) return fail('User not found')
            const result = await followUser(userId, target.id)
            return result ? ok() : fail('Failed to follow user')
        },
        async unfollow(_, { username }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const target = await userForUsername(username)
            if (!target) return fail('User not found')
            const result = await unfollowUser(userId, target.id)
            return result ? ok() : fail('Failed to unfollow user')
        },
        async removeHistory(_, { booqId }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const result = await removeBooqHistory(userId, booqId)
            return result ? ok() : fail('Failed to remove history')
        },
        signout(_, __, { clearAuth }): MutationResult {
            clearAuth()
            return ok()
        },
        async deletePasskey(_, { id }: { id: string }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const result = await deletePasskeyCredential(userId, id)
            return result ? ok() : fail('Failed to delete passkey')
        },
        async deleteAccount(_, __, { userId, clearAuth }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            clearAuth()
            const result = await deleteUserForId(userId)
            return result ? ok() : fail('Failed to delete account')
        },
        async addBookmark(_, { bookmark }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            await addBookmark({
                userId,
                id: bookmark.id,
                booqId: bookmark.booqId,
                path: bookmark.path,
            })
            return ok()
        },
        async removeBookmark(_, { id }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const result = await deleteBookmark({ id, userId })
            return result ? ok() : fail('Bookmark not found')
        },
        async addNote(_, { note }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
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
            return ok()
        },
        async removeNote(_, { id }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const result = await removeNote({ authorId: userId, id })
            return result ? ok() : fail('Note not found')
        },
        async updateNote(_, { id, kind, content }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            await updateNote({ authorId: userId, id, kind, content })
            return ok()
        },
        async addReply(_, { reply }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            await addReply({
                id: reply.id,
                noteId: reply.noteId,
                authorId: userId,
                content: reply.content,
            })
            return ok()
        },
        async removeReply(_, { id }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const result = await removeReply({ id, authorId: userId })
            return result ? ok() : fail('Reply not found')
        },
        async updateReply(_, { id, content }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const result = await updateReply({ id, authorId: userId, content })
            return result ? ok() : fail('Reply not found')
        },
        async addBooqHistory(_, { event }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            await addBooqHistory(userId, {
                booqId: event.booqId,
                path: event.path,
                date: Date.now(),
            })
            return ok()
        },
        async addToCollection(_, { booqId, name }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const result = await addToCollection({ userId, name, booqId })
            return result ? ok() : fail('Failed to add to collection')
        },
        async removeFromCollection(_, { booqId, name }, { userId }): Promise<MutationResult> {
            if (!requireAuth(userId)) return fail('Authentication required')
            const result = await removeFromCollection({ userId, name, booqId })
            return result ? ok() : fail('Failed to remove from collection')
        },
        async initiateSign(_, { email, returnTo }: { email: string, returnTo?: string }): Promise<MutationResult> {
            const result = await initiateSignRequest({
                email,
                from: returnTo ?? '/',
            })
            return result.kind !== 'error' ? ok() : fail('Failed to send sign-in email')
        },
        async completeSignIn(_, { email, secret }: { email: string, secret: string }, { setAuthForUserId }) {
            const result = await completeSignInRequest({ email, secret })
            if (!result.success) {
                return undefined
            }
            const token = generateAccessToken(result.user.id)
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
            const token = generateAccessToken(result.user.id)
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
        async confirmUpload(_, { uploadId }: { uploadId: string }, { userId }): Promise<UploadResult> {
            if (!userId) {
                return { success: false, error: 'Authentication required' }
            }
            const result = await confirmUpload(uploadId, userId)
            if (result.success) {
                const { fileBuffer, ...response } = result
                const booqId = result.booqId as BooqId
                after(async () => {
                    setCachedBooqFile(booqId, { kind: 'epub', file: fileBuffer })
                    await primeAfterUpload(booqId)
                    await extractAndUploadMissingOriginals(booqId)
                })
                return response
            }
            return result
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
