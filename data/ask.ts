'use server'
import { generateAiReply, GenerateAiReplyResult } from '@/backend/ask'

export async function generateAiReplyForNote(noteId: string): Promise<GenerateAiReplyResult> {
    return generateAiReply(noteId)
}
