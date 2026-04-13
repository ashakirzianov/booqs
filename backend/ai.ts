import { generateText, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

type AiProvider = 'openai' | 'anthropic'

const AI_PROVIDER: AiProvider = (process.env.AI_PROVIDER as AiProvider) ?? 'openai'

function getModel() {
    switch (AI_PROVIDER) {
        case 'anthropic': {
            const anthropic = createAnthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            })
            return anthropic('claude-haiku-4-5')
        }
        case 'openai':
        default: {
            const openai = createOpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            })
            return openai('o4-mini')
        }
    }
}

export async function getResponse(input: string) {
    try {
        const { text } = await generateText({
            model: getModel(),
            prompt: input,
        })
        if (!text) {
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
            output: text,
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
    const result = streamText({
        model: getModel(),
        prompt: input,
    })
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const delta of result.textStream) {
                    controller.enqueue(encoder.encode(delta))
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
