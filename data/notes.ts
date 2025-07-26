'use server'
import { BooqId, BooqRange } from '@/core'
import {
    addNote,
    removeNote,
    updateNote,
    notesWithAuthorForBooqId,
    DbNote,
    DbNoteWithAuthor,
} from '@/backend/notes'

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
    content?: string,
    targetQuote: string,
    privacy: NotePrivacy,
    createdAt: string,
    updatedAt: string,
}

export type UnresolvedBooqNote = Omit<BooqNote, 'author'> & {
    authorId: string,
}

export async function getNotesWithAuthorForBooq(booqId: BooqId): Promise<BooqNote[]> {
    const dbNotes = await notesWithAuthorForBooqId(booqId)
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
    content?: string,
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
        content: note.content ?? undefined,
        targetQuote: note.target_quote,
        privacy: note.privacy,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    }
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
        content: dbNote.content ?? undefined,
        targetQuote: dbNote.target_quote,
        privacy: dbNote.privacy,
        createdAt: dbNote.created_at,
        updatedAt: dbNote.updated_at,
    }
}