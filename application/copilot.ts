import { useQuery, gql } from '@apollo/client'
import { BooqPath } from '@/core'

export type CopilotContext = {
    text: string,
    context: string,
    booqId: string,
    title: string,
    author: string,
    language: string,
    start: BooqPath,
    end: BooqPath,
}

const SuggestQuery = gql`query SuggestQuery($context: CopilotContext!) {
    copilot(context: $context) {
        suggestions
    }
}`
type SuggestData = {
    copilot: {
        suggestions: string[],
    }
}
type SuggestVars = {
    context: CopilotContext,
}
export function useCopilotSuggestions(context: CopilotContext) {
    const { loading, data } = useQuery<SuggestData, SuggestVars>(
        SuggestQuery,
        {
            variables: { context },
            fetchPolicy: 'no-cache',
            nextFetchPolicy: 'no-cache',
        },
    )
    return {
        loading,
        suggestions: (data?.copilot.suggestions ?? []),
    }
}

const AnswerQuery = gql`query AnswerQuery($context: CopilotContext!, $question: String!) {
    copilot(context: $context) {
        answer(question: $question)
    }
}`
type AnswerData = {
    copilot: {
        answer: string,
    }
}
type AnserVars = {
    context: CopilotContext,
    question: string,
}
export function useCopilotAnswer(context: CopilotContext, question: string) {
    const { loading, data } = useQuery<AnswerData, AnserVars>(
        AnswerQuery,
        {
            variables: { context, question },
        },
    )
    return {
        loading,
        answer: (data?.copilot.answer ?? ''),
    }
}