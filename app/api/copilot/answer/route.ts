import { generateCopilotAnswer } from '@/data/copilot'
import { BooqId } from '@/core'

export async function POST(request: Request) {
    const { booqId, start, end, question } = await request.json() ?? {}
    if (typeof booqId !== 'string' || !Array.isArray(start) || !Array.isArray(end) || typeof question !== 'string') {
        return new Response('Invalid request', {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    const result = await generateCopilotAnswer({ booqId: booqId as BooqId, range: { start, end }, question })
    if (!result.success || !result.output) {
        return new Response('No answer found', {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    const answer = result.output
    return Response.json(answer)
}