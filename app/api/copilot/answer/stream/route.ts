import { generateCopilotAnswerStream } from '@/data/copilot'
import { BooqId, BooqPath } from '@/core'

export type PostBody = {
    booqId: BooqId,
    start: BooqPath,
    end: BooqPath,
    question: string,
    metadata?: any,
    highlightedText?: string,
    contextBefore?: string,
    contextAfter?: string,
}

export async function POST(request: Request) {
    const { booqId, start, end, question }: PostBody = await request.json()

    if (typeof booqId !== 'string' || !Array.isArray(start) || !Array.isArray(end) || typeof question !== 'string') {
        return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const response = await generateCopilotAnswerStream({
        booqId: booqId as BooqId,
        range: { start, end },
        question
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