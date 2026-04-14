import { BooqId, BooqRange } from '@/core'
import { nanoid } from 'nanoid'
import { addReply } from './replies'
import { generateAnswerStreaming } from './copilot'
import { AI_USER_ID, ensureAiUser } from './aiUser'

export type GenerateAiReplyParams = {
    noteId: string,
    booqId: BooqId,
    range: BooqRange,
    question: string,
}

export type GenerateAiReplyResult =
    | { success: true, stream: ReadableStream<Uint8Array> }
    | { success: false, error: { message: string, code: string } }

export async function generateAiReply({
    noteId,
    booqId,
    range,
    question,
}: GenerateAiReplyParams): Promise<GenerateAiReplyResult> {
    const result = await generateAnswerStreaming({ booqId, range, question })
    if (!result.success) {
        return result
    }

    const stream = createReplySavingStream(result.stream, noteId)
    return { success: true, stream }
}

function createReplySavingStream(
    originalStream: ReadableStream<Uint8Array>,
    noteId: string,
): ReadableStream<Uint8Array> {
    let accumulatedContent = ''
    const decoder = new TextDecoder()

    return new ReadableStream({
        start(controller) {
            const reader = originalStream.getReader()

            async function pump(): Promise<void> {
                try {
                    while (true) {
                        const { done, value } = await reader.read()

                        if (done) {
                            if (accumulatedContent) {
                                await saveAiReply(noteId, accumulatedContent)
                            }
                            controller.close()
                            break
                        }

                        const chunk = decoder.decode(value, { stream: true })
                        accumulatedContent += chunk
                        controller.enqueue(value)
                    }
                } catch (error) {
                    console.error('Ask stream error:', error)
                    controller.error(error)
                } finally {
                    reader.releaseLock()
                }
            }

            pump()
        }
    })
}

async function saveAiReply(noteId: string, content: string): Promise<void> {
    try {
        await ensureAiUser()
        await addReply({
            id: nanoid(10),
            noteId,
            authorId: AI_USER_ID,
            content,
        })
    } catch (error) {
        console.error('Failed to save AI reply:', error)
    }
}
