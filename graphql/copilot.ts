import { generateSuggestions, generateAnswer, generateAnswerStreaming } from '@/backend/copilot'
import { BooqId } from '@/core'
import { IResolvers } from '@graphql-tools/utils'

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
                const reader = result.stream.getReader()
                const decoder = new TextDecoder()
                try {
                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break
                        yield { copilotAnswerStream: decoder.decode(value) }
                    }
                } finally {
                    reader.releaseLock()
                }
            },
        },
    },
}
