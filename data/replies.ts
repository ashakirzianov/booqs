'use server'
import {
    addReply,
    removeReply,
    updateReply,
    repliesForNotes,
    DbReply,
    DbReplyWithAuthor,
} from '@/backend/replies'
import { NoteAuthorData } from './notes'

export type BooqReply = {
    id: string,
    noteId: string,
    author: NoteAuthorData,
    content: string,
    createdAt: string,
    updatedAt: string,
}

export type UnresolvedBooqReply = Omit<BooqReply, 'author'> & {
    authorId: string,
}

export async function fetchReplies(noteIds: string[]): Promise<BooqReply[]> {
    const dbReplies = await repliesForNotes(noteIds)
    return dbReplies.map(replyFromDbReplyWithAuthor)
}

export async function createReply({
    id,
    noteId,
    authorId,
    content,
}: {
    id: string,
    noteId: string,
    authorId: string,
    content: string,
}): Promise<UnresolvedBooqReply | undefined> {
    try {
        const dbReply = await addReply({ id, noteId, authorId, content })
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
        noteId: reply.note_id,
        authorId: reply.author_id,
        content: reply.content,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
    }
}

function replyFromDbReplyWithAuthor(dbReply: DbReplyWithAuthor): BooqReply {
    return {
        id: dbReply.id,
        noteId: dbReply.note_id,
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
