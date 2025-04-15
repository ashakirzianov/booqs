import { generateAnswer } from '@/backend/ai'

export async function POST(request: Request) {
    const {
        text, context, title, author, language,
        question,
    } = await request.json() ?? {}
    if (typeof text !== 'string' || typeof context !== 'string' || typeof question !== 'string') {
        return new Response('Invalid request', {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    const answer = await generateAnswer({
        text, context, title, author, language,
    }, question)
    return Response.json(answer)
}