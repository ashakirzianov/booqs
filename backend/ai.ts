import OpenAI from 'openai'

const AI_MODEL = 'o4-mini'

export async function getResponse(input: string) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })
    try {
        const response = await openai.responses.create({
            model: AI_MODEL,
            input,
        })
        if (response.error) {
            return {
                success: false as const,
                error: {
                    message: response.error.message,
                    code: response.error.code,
                },
            }
        } else if (!response.output_text) {
            return {
                success: false as const,
                error: {
                    message: 'No output text returned from AI',
                    code: 'NO_OUTPUT_TEXT',
                },
            }
        }
        return {
            success: true as const,
            output: response.output_text,
        }
    } catch (e) {
        console.error('getResponse', e)
        return {
            success: false as const,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        }
    }
}

export async function getStreamingResponse(input: string) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })

    const response = await openai.responses.create({
        model: AI_MODEL,
        input,
        stream: true,
    })
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const event of response) {
                    if (event.type === 'error') {
                        controller.close()
                        return
                    }

                    if (event.type === 'response.failed') {
                        controller.close()
                        return
                    }

                    if (event.type === 'response.output_text.delta') {
                        controller.enqueue(encoder.encode(event.delta))
                    }
                }
                controller.close()
            } catch (e) {
                console.error('Stream error:', e)
                controller.close()
            }
        }
    })

    return {
        success: true as const,
        stream,
    }
}