'use server'
import { BooqId, BooqRange } from '@/core'
import {
    addNote,
    removeNote,
    updateNote,
    notesWithAuthorFor,
    getBooqsWithOwnNotes,
    DbNote,
    DbNoteWithAuthor,
} from '@/backend/notes'
import { getUserIdInsideRequest } from './request'

export type NotePrivacy = 'private' | 'public'

export type NoteAuthorData = {
    id: string,
    username: string,
    name: string,
    emoji: string,
    profilePictureURL?: string,
}

export type BooqNote = {
    id: string,
    booqId: BooqId,
    author: NoteAuthorData,
    range: BooqRange,
    kind: string,
    content?: string | null,
    targetQuote: string,
    privacy: NotePrivacy,
    createdAt: string,
    updatedAt: string,
}

export type UnresolvedBooqNote = Omit<BooqNote, 'author'> & {
    authorId: string,
}

export async function fetchNotes({ booqId, authorId }: {
    booqId?: BooqId,
    authorId?: string,
}): Promise<BooqNote[]> {
    const userId = await getUserIdInsideRequest()
    const dbNotes = await notesWithAuthorFor({ booqId, authorId, userId })
    return dbNotes.map(noteFromDbNoteWithAuthor)
}

export async function createNote({
    id,
    authorId,
    booqId,
    range,
    kind,
    content,
    targetQuote,
    privacy = 'private',
}: {
    id: string,
    authorId: string,
    booqId: BooqId,
    range: BooqRange,
    kind: string,
    content?: string,
    targetQuote: string,
    privacy?: NotePrivacy,
}): Promise<UnresolvedBooqNote | undefined> {
    try {
        const dbNote = await addNote({
            id,
            authorId,
            booqId,
            range,
            kind,
            content,
            targetQuote,
            privacy,
        })
        return unresolvedBooqNote(dbNote)
    } catch (error) {
        console.error('Error creating note:', error)
        return undefined
    }

}

export async function deleteNote({
    id,
    authorId,
}: {
    id: string,
    authorId: string,
}): Promise<boolean> {
    return removeNote({ id, authorId })
}

export async function modifyNote({
    id,
    authorId,
    kind,
    content,
}: {
    id: string,
    authorId: string,
    kind?: string,
    content?: string | null,
}): Promise<UnresolvedBooqNote | null> {
    const result = await updateNote({ id, authorId, kind, content })
    if (result === null) {
        return null
    }
    return unresolvedBooqNote(result)
}

function unresolvedBooqNote(note: DbNote): UnresolvedBooqNote {
    return {
        id: note.id,
        booqId: note.booq_id as BooqId,
        authorId: note.author_id,
        range: {
            start: note.start_path,
            end: note.end_path,
        },
        kind: note.kind,
        content: note.content,
        targetQuote: note.target_quote,
        privacy: note.privacy,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    }
}

export async function fetchBooqsWithOwnNotes(): Promise<BooqId[]> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return []
    }
    const booqIds = await getBooqsWithOwnNotes(userId)
    return booqIds as BooqId[]
}

function noteFromDbNoteWithAuthor(dbNote: DbNoteWithAuthor): BooqNote {
    return {
        id: dbNote.id,
        booqId: dbNote.booq_id as BooqId,
        author: {
            id: dbNote.author_id,
            name: dbNote.author_name,
            username: dbNote.author_username,
            profilePictureURL: dbNote.author_profile_picture_url ?? undefined,
            emoji: dbNote.author_emoji,
        },
        range: {
            start: dbNote.start_path,
            end: dbNote.end_path,
        },
        kind: dbNote.kind,
        content: dbNote.content,
        targetQuote: dbNote.target_quote,
        privacy: dbNote.privacy,
        createdAt: dbNote.created_at,
        updatedAt: dbNote.updated_at,
    }
}