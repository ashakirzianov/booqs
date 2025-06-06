import { BooqPath } from '@/core'
import useSWR from 'swr'

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

async function postFetcher(path: string, body: object) {
    const res = await fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    return res.json()
}

export function useCopilotSuggestions(context: CopilotContext) {
    const { data, isLoading } = useSWR<string[]>(
        '/api/copilot/suggestions',
        (key: string) => postFetcher(key, context),
    )
    return {
        loading: isLoading,
        suggestions: (data ?? []),
    }
}

export function useCopilotAnswer(context: CopilotContext, question: string) {
    const { data, isLoading } = useSWR<string[]>(
        '/api/copilot/answer',
        (key: string) => postFetcher(key, {
            ...context,
            question,
        }),
    )
    return {
        loading: isLoading,
        answer: (data ?? []),
    }
}