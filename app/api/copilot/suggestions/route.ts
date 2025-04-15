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
    console.log('here 3', suggestions)
    return Response.json(suggestions)
}