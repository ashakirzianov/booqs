import { generateCopilotAnswerStream } from '@/data/copilot'
import { BooqId, BooqPath } from '@/core'
import { getUserIdInsideRequest } from '@/data/request'

export type PostBody = {
    booqId: BooqId,
    start: BooqPath,
    end: BooqPath,
    question: string,
    metadata?: any,
    highlightedText?: string,
    contextBefore?: string,
    contextAfter?: string,
    footnote?: string,
}

export async function POST(request: Request) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { booqId, start, end, question, footnote }: PostBody = await request.json()

    if (typeof booqId !== 'string' || !Array.isArray(start) || !Array.isArray(end) || typeof question !== 'string') {
        return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const response = await generateCopilotAnswerStream({
        booqId: booqId as BooqId,
        range: { start, end },
        question,
        footnote
    })

    if (!response.success) {
        return Response.json({ error: response.error }, { status: 500 })
    }

    return new Response(response.stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
        },
    })
}