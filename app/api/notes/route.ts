import {
    NoteAuthorData,
    fetchNotes,
    NotePrivacy,
} from '@/data/notes'
import { BooqId, BooqRange } from '@/core'
import { NextRequest } from 'next/server'

export type ResolvedNote = {
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
export type GetResponse = {
    notes: ResolvedNote[],
}
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const booq_id = searchParams.get('booq_id')
    if (!booq_id) {
        return Response.json({ error: 'Missing booq_id' }, { status: 400 })
    }
    const booqId: BooqId = booq_id as BooqId
    const notes = await fetchNotes({ booqId })
    const result: GetResponse = {
        notes,
    }
    return Response.json(result)
}