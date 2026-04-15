import { BooqId } from '@/core'
import { nanoid } from 'nanoid'
import { addReply, hasReplyFromAuthor } from './replies'
import { generateAnswerStreaming } from './ai'
import { noteForId } from './notes'
import { AI_USER_ID, ensureAiUser } from './aiUser'

export type GenerateAiReplyResult =
    | { success: true, stream: ReadableStream<Uint8Array> }
    | { success: false, error: { message: string, code: string } }

export async function generateAiReply(noteId: string): Promise<GenerateAiReplyResult> {
    const note = await noteForId(noteId)
    if (!note) {
        return { success: false, error: { message: 'Note not found', code: 'NOT_FOUND' } }
    }
    if (!note.content) {
        return { success: false, error: { message: 'Note has no content', code: 'NO_CONTENT' } }
    }

    const alreadyReplied = await hasReplyFromAuthor({ noteId, authorId: AI_USER_ID })
    if (alreadyReplied) {
        return { success: false, error: { message: 'AI reply already exists', code: 'ALREADY_EXISTS' } }
    }

    const result = await generateAnswerStreaming({
        booqId: note.booq_id as BooqId,
        range: { start: note.start_path, end: note.end_path },
        question: note.content,
    })
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
        const alreadyReplied = await hasReplyFromAuthor({ noteId, authorId: AI_USER_ID })
        if (alreadyReplied) return
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
