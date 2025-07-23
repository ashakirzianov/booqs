import { BooqId, BooqRange } from '@/core'
import { generateSuggestions, generateAnswer, generateAnswerStreaming } from '@/backend/copilot'

export async function generateCopilotSuggestions({ booqId, range }: { booqId: BooqId, range: BooqRange }) {
    return generateSuggestions(booqId, range)
}

export async function generateCopilotAnswer({ booqId, range, question }: { booqId: BooqId, range: BooqRange, question: string }) {
    return generateAnswer(booqId, range, question)
}

export async function generateCopilotAnswerStream({ booqId, range, question }: { booqId: BooqId, range: BooqRange, question: string }) {
    return generateAnswerStreaming(booqId, range, question)
}