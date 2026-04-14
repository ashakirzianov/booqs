import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { BooqId, BooqRange, getQuoteAndContext } from '@/core'
import { getExtraMetadataValues } from '@/core/meta'
import { booqForId } from './library'
import { getRedisCacheValue, createRedisCachingStream } from './cache'

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

// --- Answer generation with reading context ---

type ReadingContext = {
    text: string,
    contextBefore: string,
    contextAfter: string,
    title?: string,
    author?: string,
    language?: string,
}

export async function generateAnswerStreaming({ booqId, range, question, footnote }: { booqId: BooqId, range: BooqRange, question: string, footnote?: string }) {
    const cacheKey = cacheKeyForAnswer({ booqId, range, question, footnote })

    // Check cache first
    const cachedAnswer = await getRedisCacheValue<string>(cacheKey)
    if (cachedAnswer) {
        return {
            success: true as const,
            stream: createCachedResponseStream(cachedAnswer),
        }
    }

    const context = await buildReadingContext(booqId, range)
    if (!context) {
        return {
            success: false as const,
            error: {
                message: 'Could not build reading context',
                code: 'CONTEXT_ERROR',
            },
        }
    }

    const prompt = buildPromptForAnswer(context, question, footnote)
    const result = await getStreamingResponse(prompt)

    if (result.success) {
        return {
            success: true as const,
            stream: createRedisCachingStream(result.stream, cacheKey),
        }
    }

    return result
}

function cacheKeyForAnswer({ booqId, range, question, footnote }: { booqId: BooqId, range: BooqRange, question: string, footnote?: string }): string {
    const rangeKey = `${range.start.join(',')}-${range.end.join(',')}`
    const footnoteKey = footnote ? Buffer.from(footnote).toString('base64') : ''
    return `ai:answer:${booqId}:${rangeKey}:${Buffer.from(question).toString('base64')}:${footnoteKey}`
}

function createCachedResponseStream(cachedResponse: string): ReadableStream<Uint8Array> {
    let sent = false

    return new ReadableStream({
        start(controller) {
            if (!sent) {
                controller.enqueue(new TextEncoder().encode(cachedResponse))
                sent = true
            }
            controller.close()
        }
    })
}

async function buildReadingContext(booqId: BooqId, range: BooqRange): Promise<ReadingContext | undefined> {
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }
    const { quote, contextBefore, contextAfter } = getQuoteAndContext(booq.nodes, range, 2000)
    if (!quote) {
        return undefined
    }
    const languages = getExtraMetadataValues('language', booq.metadata.extra)
    return {
        text: quote,
        contextBefore,
        contextAfter,
        title: booq.metadata.title,
        author: booq.metadata.authors[0]?.name,
        language: languages[0],
    }
}

function buildPromptForAnswer(context: ReadingContext, question: string, footnote?: string) {
    return `
You are a helpful reading assistant embedded in a book reading app. A user has selected a passage in a book and asked a question. Use the selected passage, the surrounding context, and the book's metadata to answer helpfully and concisely. If relevant, provide a brief explanation or interpretation. If the question cannot be answered from the text, politely say so.

## Book Metadata
Title: ${context.title || 'Unknown Title'}
Author: ${context.author || 'Unknown Author'}
Language: ${context.language || 'Unknown Language'}

## Selected Passage
"${context.text}"

## Context Before
${context.contextBefore}

## Context After
${context.contextAfter}
${footnote ? `
## Additional Note
The user has provided this note about the selected passage: "${footnote}"
` : ''}
## User's Question
${question}

## Answer
`
}
