export const maxDuration = 60

import { generateAiReplyForNote } from '@/data/ask'
import { getUserIdInsideRequest } from '@/data/request'

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ noteId: string }> },
) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { noteId } = await params

    const result = await generateAiReplyForNote(noteId)

    if (!result.success) {
        return Response.json({ error: result.error }, { status: 500 })
    }

    return new Response(result.stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
        },
    })
}
