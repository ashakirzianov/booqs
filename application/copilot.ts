'use client'

import type { PostBody as SuggestionsPostBody, PostResponse as SuggestionsPostResponse } from '@/app/api/copilot/suggestions/route'
import type { PostBody as AnswerPostBody, PostResponse as AnswerPostResponse } from '@/app/api/copilot/answer/route'
import { BooqId, BooqPath } from '@/core'
import useSWR from 'swr'

export function useCopilotSuggestions({
    booqId,
    start,
    end,
}: {
    booqId: BooqId,
    start: BooqPath,
    end: BooqPath,
}) {
    const { data, isLoading } = useSWR<SuggestionsPostResponse>(
        `/api/copilot/suggestions-${booqId}-${start.join(',')}-${end.join(',')}`,
        async () => {
            const body: SuggestionsPostBody = { booqId, start, end }
            const res = await fetch('/api/copilot/suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error('Failed to fetch suggestions')
            }
            const result: SuggestionsPostResponse = await res.json()
            return result
        }
    )

    return {
        loading: isLoading,
        suggestions: data ?? [],
    } satisfies {
        loading: boolean,
        suggestions: string[],
    }
}

export function useCopilotAnswer({
    booqId,
    start,
    end,
    question,
}: {
    booqId: BooqId,
    start: BooqPath,
    end: BooqPath,
    question: string,
}) {
    const { data, isLoading } = useSWR<AnswerPostResponse>(
        `/api/copilot/answer-${booqId}-${start.join(',')}-${end.join(',')}-${question}`,
        async () => {
            const body: AnswerPostBody = { booqId, start, end, question }
            const res = await fetch('/api/copilot/answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error('Failed to fetch answer')
            }
            const result: AnswerPostResponse = await res.json()
            return result
        }
    )

    return {
        loading: isLoading,
        answer: data,
    } satisfies {
        loading: boolean,
        answer: string | undefined,
    }
}