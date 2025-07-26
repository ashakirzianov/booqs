import { BooqId, BooqRange } from '@/core'
import {
    addNote,
    removeNote,
    updateNote,
    notesWithAuthorForBooqId,
    DbNote,
    DbNoteWithAuthor,
    NotePrivacy,
} from '@/backend/notes'

export type { DbNote, DbNoteWithAuthor, NotePrivacy }

export async function getNotesWithAuthorForBooq(booqId: BooqId): Promise<DbNoteWithAuthor[]> {
    return notesWithAuthorForBooqId(booqId)
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
}): Promise<DbNote> {
    return addNote({
        id,
        authorId,
        booqId,
        range,
        kind,
        content,
        targetQuote,
        privacy,
    })
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
}): Promise<DbNote | null> {
    return updateNote({ id, authorId, kind, content })
}