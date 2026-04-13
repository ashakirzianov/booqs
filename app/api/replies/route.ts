import { NoteAuthorData } from '@/data/notes'
import { fetchReplies } from '@/data/replies'
import { NextRequest } from 'next/server'

export type ResolvedReply = {
    id: string,
    noteId: string,
    author: NoteAuthorData,
    content: string,
    createdAt: string,
    updatedAt: string,
}
export type GetResponse = {
    replies: ResolvedReply[],
}
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const noteId = searchParams.get('note_id')
    if (!noteId) {
        return Response.json({ error: 'Missing note_id' }, { status: 400 })
    }
    const replies = await fetchReplies([noteId])
    const result: GetResponse = { replies }
    return Response.json(result)
}
