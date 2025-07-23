import { generateCopilotAnswer } from '@/data/copilot'
import { BooqId, BooqPath } from '@/core'

export type PostBody = {
    booqId: BooqId,
    start: BooqPath,
    end: BooqPath,
    question: string,
}

export type PostResponse = string

export async function POST(request: Request) {
    const { booqId, start, end, question }: PostBody = await request.json()

    if (typeof booqId !== 'string' || !Array.isArray(start) || !Array.isArray(end) || typeof question !== 'string') {
        return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const result = await generateCopilotAnswer({
        booqId: booqId as BooqId,
        range: { start, end },
        question
    })

    if (!result.success || !result.output) {
        return Response.json({ error: 'No answer found' }, { status: 404 })
    }

    const response: PostResponse = result.output
    return Response.json(response)
}