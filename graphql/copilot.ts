import { generateSuggestions, generateAnswer, generateAnswerStreaming } from '@/backend/copilot'
import { generateAiReply } from '@/backend/ask'
import { BooqId } from '@/core'
import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'

export type CopilotInput = {
    booqId: string,
    start: number[],
    end: number[],
}
export type CopilotParent = CopilotInput
export const copilotResolver: IResolvers<CopilotParent> = {
    Copilot: {
        async suggestions(parent) {
            const result = await generateSuggestions({
                booqId: parent.booqId as BooqId,
                range: { start: parent.start, end: parent.end },
            })
            if (!result.success) {
                return []
            }
            return result.suggestions
        },
        async answer(parent, { question }) {
            const result = await generateAnswer({
                booqId: parent.booqId as BooqId,
                range: { start: parent.start, end: parent.end },
                question,
            })
            if (!result.success) {
                return undefined
            }
            return result.output
        },
    },
    Subscription: {
        copilotAnswerStream: {
            async *subscribe(_, { context, question, footnote }: {
                context: CopilotInput,
                question: string,
                footnote?: string,
            }) {
                const result = await generateAnswerStreaming({
                    booqId: context.booqId as BooqId,
                    range: { start: context.start, end: context.end },
                    question,
                    footnote,
                })
                if (!result.success) {
                    return
                }
                yield* streamChunks('copilotAnswerStream', result.stream)
            },
        },
        generateReply: {
            async *subscribe(_: unknown, { noteId }: {
                noteId: string,
            }, { userId }: ResolverContext) {
                if (!userId) {
                    return
                }
                const result = await generateAiReply(noteId)
                if (!result.success) {
                    return
                }
                yield* streamChunks('generateReply', result.stream)
            },
        },
    },
}

async function* streamChunks(fieldName: string, stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            yield { [fieldName]: decoder.decode(value) }
        }
    } finally {
        reader.releaseLock()
    }
}
