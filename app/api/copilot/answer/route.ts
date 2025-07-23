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
    const answer = await generateCopilotAnswer(booqId as BooqId, { start, end }, question)
    return Response.json(answer)
}