import { BooqId, BooqRange, getQuoteAndContext } from '@/core'
import { getExtraMetadataValues } from '@/core/meta'
import { getResponse, getStreamingResponse } from './ai'
import { booqForId } from './booq'

export type ReadingContext = {
    text: string,
    contextBefore: string,
    contextAfter: string,
    title?: string,
    author?: string,
    language?: string,
}

export async function generateSuggestions(booqId: BooqId, range: BooqRange) {
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

export async function generateAnswer(booqId: BooqId, range: BooqRange, question: string) {
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
    return result
}

export async function generateAnswerStreaming(booqId: BooqId, range: BooqRange, question: string) {
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
    return getStreamingResponse(prompt)
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

function buildPromptForAnswer(context: ReadingContext, question: string) {
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