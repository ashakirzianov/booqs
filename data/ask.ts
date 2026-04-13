'use server'
import { BooqId, BooqRange } from '@/core'
import { askQuestion, AskQuestionResult } from '@/backend/ask'

export async function askBooqQuestion({ noteId, booqId, range, question, targetQuote, authorId }: {
    noteId: string,
    booqId: BooqId,
    range: BooqRange,
    question: string,
    targetQuote: string,
    authorId: string,
}): Promise<AskQuestionResult> {
    return askQuestion({ noteId, booqId, range, question, targetQuote, authorId })
}
