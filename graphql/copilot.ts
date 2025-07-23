import { generateSuggestions, generateAnswer } from '@/backend/copilot'
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
            const result = await generateSuggestions(parent.booqId as BooqId, { start: parent.start, end: parent.end })
            if (!result.success) {
                return []
            }
            return result.suggestions
        },
        async answer(parent, { question }) {
            const result = await generateAnswer(parent.booqId as BooqId, { start: parent.start, end: parent.end }, question)
            if (!result.success) {
                return undefined
            }
            return result.output
        },
    },
}
