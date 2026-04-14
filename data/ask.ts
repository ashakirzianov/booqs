'use server'
import { BooqId, BooqRange } from '@/core'
import { generateAiReply, GenerateAiReplyResult } from '@/backend/ask'

export async function generateAiReplyForQuestion({ noteId, booqId, range, question }: {
    noteId: string,
    booqId: BooqId,
    range: BooqRange,
    question: string,
}): Promise<GenerateAiReplyResult> {
    return generateAiReply({ noteId, booqId, range, question })
}
