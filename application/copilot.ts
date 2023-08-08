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
};
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
    console.log(data)
    return {
        loading,
        suggestions: (data?.copilot.suggestions ?? []),
    }
}