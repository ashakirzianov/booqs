import { generateCopilotSuggestions } from '@/data/copilot'
import { BooqId, BooqPath } from '@/core'

export type PostBody = {
    booqId: BooqId,
    start: BooqPath,
    end: BooqPath,
}

export type PostResponse = string[]

export async function POST(request: Request) {
    const { booqId, start, end }: PostBody = await request.json()
    
    if (typeof booqId !== 'string' || !Array.isArray(start) || !Array.isArray(end)) {
        return Response.json({ error: 'Invalid request' }, { status: 400 })
    }
    
    const result = await generateCopilotSuggestions({ 
        booqId: booqId as BooqId, 
        range: { start, end } 
    })
    
    if (!result.success) {
        return Response.json({ error: 'No suggestions found' }, { status: 404 })
    }
    
    const response: PostResponse = result.suggestions
    return Response.json(response)
}