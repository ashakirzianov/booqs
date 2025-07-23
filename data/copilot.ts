import { BooqId, BooqRange } from '@/core'
import { buildReadingContext } from '@/backend/booq'
import { generateSuggestions, generateAnswer } from '@/backend/ai'

export async function generateCopilotSuggestions({ booqId, range }: { booqId: BooqId, range: BooqRange }) {
    const context = await buildReadingContext(booqId, range)
    if (!context) {
        return []
    }
    return generateSuggestions(context)
}

export async function generateCopilotAnswer({ booqId, range, question }: { booqId: BooqId, range: BooqRange, question: string }) {
    const context = await buildReadingContext(booqId, range)
    if (!context) {
        return undefined
    }
    return generateAnswer(context, question)
}