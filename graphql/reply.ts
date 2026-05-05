import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { DbReply } from '@/backend/replies'
import { DbUser } from '@/backend/users'
import { AnnotationParent } from './annotation'
import { repliesForNotes } from '@/backend/replies'

export type ReplyParent = DbReply
export const replyResolver: IResolvers<ReplyParent | AnnotationParent, ResolverContext> = {
    Annotation: {
        async replies(parent: AnnotationParent): Promise<DbReply[]> {
            const replies = await repliesForNotes([parent.id])
            return replies
        },
    },
    Reply: {
        async author(parent: ReplyParent, _, { userLoader }): Promise<DbUser | null> {
            return userLoader.load(parent.author_id)
        },
        annotationId(parent: ReplyParent) {
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
