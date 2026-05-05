'use server'
import {
    addReply,
    removeReply,
    updateReply,
    repliesForAnnotations,
    DbReply,
    DbReplyWithAuthor,
} from '@/backend/replies'
import { AnnotationAuthorData } from './annotations'

export type BooqReply = {
    id: string,
    annotationId: string,
    author: AnnotationAuthorData,
    content: string,
    createdAt: string,
    updatedAt: string,
}

export type UnresolvedBooqReply = Omit<BooqReply, 'author'> & {
    authorId: string,
}

export async function fetchReplies(annotationIds: string[]): Promise<BooqReply[]> {
    const dbReplies = await repliesForAnnotations(annotationIds)
    return dbReplies.map(replyFromDbReplyWithAuthor)
}

export async function createReply({
    id,
    annotationId,
    authorId,
    content,
}: {
    id: string,
    annotationId: string,
    authorId: string,
    content: string,
}): Promise<UnresolvedBooqReply | undefined> {
    try {
        const dbReply = await addReply({ id, annotationId, authorId, content })
        return unresolvedBooqReply(dbReply)
    } catch (error) {
        console.error('Error creating reply:', error)
        return undefined
    }
}

export async function deleteReply({
    id,
    authorId,
}: {
    id: string,
    authorId: string,
}): Promise<boolean> {
    return removeReply({ id, authorId })
}

export async function modifyReply({
    id,
    authorId,
    content,
}: {
    id: string,
    authorId: string,
    content: string,
}): Promise<UnresolvedBooqReply | undefined> {
    const result = await updateReply({ id, authorId, content })
    if (result === null) {
        return undefined
    }
    return unresolvedBooqReply(result)
}

function unresolvedBooqReply(reply: DbReply): UnresolvedBooqReply {
    return {
        id: reply.id,
        annotationId: reply.annotation_id,
        authorId: reply.author_id,
        content: reply.content,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
    }
}

function replyFromDbReplyWithAuthor(dbReply: DbReplyWithAuthor): BooqReply {
    return {
        id: dbReply.id,
        annotationId: dbReply.annotation_id,
        author: {
            id: dbReply.author_id,
            name: dbReply.author_name,
            username: dbReply.author_username,
            profilePictureURL: dbReply.author_profile_picture_url ?? undefined,
            emoji: dbReply.author_emoji,
        },
        content: dbReply.content,
        createdAt: dbReply.created_at,
        updatedAt: dbReply.updated_at,
    }
}
