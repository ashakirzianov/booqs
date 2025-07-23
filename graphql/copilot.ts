import { buildReadingContext } from '@/backend/booq'
import { generateSuggestions, generateAnswer } from '@/backend/ai'
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
            const context = await buildReadingContext(parent.booqId as BooqId, { start: parent.start, end: parent.end })
            if (!context) {
                return []
            }
            const result = await generateSuggestions(context)
            if (!result.success) {
                return []
            }
            return result.suggestions
        },
        async answer(parent, { question }) {
            const context = await buildReadingContext(parent.booqId as BooqId, { start: parent.start, end: parent.end })
            if (!context) {
                return undefined
            }
            const result = await generateAnswer(context, question)
            if (!result.success) {
                return undefined
            }
            return result.output
        },
    },
}
