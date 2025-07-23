import { BooqId, BooqPath } from '@/core'
import { buildReadingContext } from '@/backend/booq'
import { generateSuggestions, generateAnswer } from '@/backend/ai'

export type CopilotRange = {
    start: BooqPath,
    end: BooqPath,
}

export async function generateCopilotSuggestions(booqId: BooqId, range: CopilotRange) {
    const context = await buildReadingContext(booqId, range)
    if (!context) {
        return []
    }
    return generateSuggestions(context)
}

export async function generateCopilotAnswer(booqId: BooqId, range: CopilotRange, question: string) {
    const context = await buildReadingContext(booqId, range)
    if (!context) {
        return undefined
    }
    return generateAnswer(context, question)
}