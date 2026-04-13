export const maxDuration = 60

import { BooqId, BooqPath } from '@/core'
import { askBooqQuestion } from '@/data/ask'
import { getUserIdInsideRequest } from '@/data/request'

type PostBody = {
    noteId: string,
    booqId: BooqId,
    start: BooqPath,
    end: BooqPath,
    question: string,
    targetQuote: string,
}

export async function POST(request: Request) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { noteId, booqId, start, end, question, targetQuote }: PostBody = await request.json()

    if (
        typeof noteId !== 'string'
        || typeof booqId !== 'string'
        || !Array.isArray(start)
        || !Array.isArray(end)
        || typeof question !== 'string'
        || typeof targetQuote !== 'string'
    ) {
        return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const result = await askBooqQuestion({
        noteId,
        booqId: booqId as BooqId,
        range: { start, end },
        question,
        targetQuote,
        authorId: userId,
    })

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
