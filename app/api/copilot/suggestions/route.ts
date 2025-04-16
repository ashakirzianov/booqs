import { generateSuggestions } from '@/backend/ai'

export async function POST(request: Request) {
    const { text, context, title, author, language } = await request.json() ?? {}
    if (typeof text !== 'string' || typeof context !== 'string') {
        return new Response('Invalid request', {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    const suggestions = await generateSuggestions({
        text, context, title, author, language,
    })
    return Response.json(suggestions)
}