import { generateCopilotSuggestions } from '@/data/copilot'
import { BooqId } from '@/core'

export async function POST(request: Request) {
    const { booqId, start, end } = await request.json() ?? {}
    if (typeof booqId !== 'string' || !Array.isArray(start) || !Array.isArray(end)) {
        return new Response('Invalid request', {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    const suggestions = await generateCopilotSuggestions({ booqId: booqId as BooqId, range: { start, end } })
    return Response.json(suggestions)
}