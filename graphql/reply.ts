import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { DbReply } from '@/backend/replies'
import { DbUser } from '@/backend/users'
import { NoteParent } from './note'
import { repliesForNotes } from '@/backend/replies'

export type ReplyParent = DbReply
export const replyResolver: IResolvers<ReplyParent | NoteParent, ResolverContext> = {
    Note: {
        async replies(parent: NoteParent): Promise<DbReply[]> {
            const replies = await repliesForNotes([parent.id])
            return replies
        },
    },
    Reply: {
        async author(parent: ReplyParent, _, { userLoader }): Promise<DbUser | null> {
            return userLoader.load(parent.author_id)
        },
        noteId(parent: ReplyParent) {
            return parent.note_id
        },
        createdAt(parent: ReplyParent) {
            return parent.created_at
        },
        updatedAt(parent: ReplyParent) {
            return parent.updated_at
        },
    },
}
