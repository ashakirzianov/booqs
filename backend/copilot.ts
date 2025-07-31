import { BooqId, BooqRange, getQuoteAndContext } from '@/core'
import { getExtraMetadataValues } from '@/core/meta'
import { getResponse, getStreamingResponse } from './ai'
import { booqForId } from './access'
import { getCachedValueForKey, cacheValueForKey, createCachingStream } from './cache'

export type ReadingContext = {
    text: string,
    contextBefore: string,
    contextAfter: string,
    title?: string,
    author?: string,
    language?: string,
}

export async function generateSuggestions({ booqId, range }: { booqId: BooqId, range: BooqRange }) {
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

    const prompt = buildPromptForSuggestions(context)
    const result = await getResponse(prompt)
    if (!result.success) {
        return result
    }
    const suggestions = parseSuggestion(result.output)
    return {
        success: true as const,
        suggestions,
    }
}

export async function generateAnswer({ booqId, range, question }: { booqId: BooqId, range: BooqRange, question: string }) {
    const cacheKey = cacheKeyForAnswer({ booqId, range, question })

    // Check cache first
    const cachedAnswer = await getCachedValueForKey<string>(cacheKey)
    if (cachedAnswer) {
        return {
            success: true as const,
            output: cachedAnswer,
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

    const prompt = buildPromptForAnswer(context, question)
    const result = await getResponse(prompt)

    // Cache successful responses
    if (result.success) {
        await cacheValueForKey(cacheKey, result.output)
    }

    return result
}

export async function generateAnswerStreaming({ booqId, range, question, footnote }: { booqId: BooqId, range: BooqRange, question: string, footnote?: string }) {
    const cacheKey = cacheKeyForAnswer({ booqId, range, question, footnote })

    // Check cache first
    const cachedAnswer = await getCachedValueForKey<string>(cacheKey)
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
            stream: createCachingStream(result.stream, cacheKey),
        }
    }

    return result
}

function cacheKeyForAnswer({ booqId, range, question, footnote }: { booqId: BooqId, range: BooqRange, question: string, footnote?: string }): string {
    const rangeKey = `${range.start.join(',')}-${range.end.join(',')}`
    const footnoteKey = footnote ? Buffer.from(footnote).toString('base64') : ''
    return `copilot:answer:${booqId}:${rangeKey}:${Buffer.from(question).toString('base64')}:${footnoteKey}`
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

function parseSuggestion(suggestion: string): string[] {
    return suggestion.split('?')
        .map(s => {
            const trimmed = trimNumberPrefix(s)
            if (trimmed === '') {
                return undefined
            } else {
                return trimmed + '?'
            }
        })
        .filter((s): s is string => s !== undefined)
}

function trimNumberPrefix(s: string) {
    return s.replace(/^\s*\d*[. ]/, '').trim()
}

function buildPromptForSuggestions(context: ReadingContext) {
    return `You are assisting user to read ${bookDescription(context)}. User might want to ask different questions about the particular part of the book. You'll be supplied with excerpt of the book and the context around it. You should suggest from 1 to 3 questions that user is likely to ask about the excerpt. Each question must be a single sentense and end with question mark.
        Prioritize this potential questions:
        - Questions about cultural references
        - Questions about used special terms if they are not obvious
        - Questions about previous interactions with the character (if you know the book well and if the character is mentioned in the excerpt)
        - Questions about meaning of the excerpt if it is not obvious
        
I selected excerpt "${context.text}" with context before "${context.contextBefore}" and context after "${context.contextAfter}". Please suggest questions that I might want to ask about this excerpt.`
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

function bookDescription(context: ReadingContext) {
    let description = ''
    if (context.title) {
        description += `"${context.title}"`
    }
    if (context.author) {
        description += ` by ${context.author}`
    }
    if (context.language) {
        description += ` (in "${context.language}" language)`
    }
    return description
}