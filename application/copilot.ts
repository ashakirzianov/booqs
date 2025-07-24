'use client'

import type { PostBody as SuggestionsPostBody, PostResponse as SuggestionsPostResponse } from '@/app/api/copilot/suggestions/route'
import type { PostBody as AnswerPostBody, PostResponse as AnswerPostResponse } from '@/app/api/copilot/answer/route'
import type { PostBody as AnswerStreamPostBody } from '@/app/api/copilot/answer/stream/route'
import { BooqId, BooqPath } from '@/core'
import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { CacheEvent, createStreamingCache } from './cache'

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

export function useCopilotAnswerStream({
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
    const [loading, setLoading] = useState(false)
    const [answer, setAnswer] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setAnswer('')
        setError(null)
        const cacheKey = generateCacheKey({ booqId, start, end, question })
        function listener(event: CacheEvent<string>) {
            if (event.event === 'chunk') {
                setAnswer(prev => prev + event.chunk)
            } else if (event.event === 'error') {
                setError(event.error)
                setLoading(false)
            } else if (event.event === 'complete') {
                setLoading(false)
            }
        }
        streamingAnswerCache.subscribe(cacheKey, listener)
        return () => {
            streamingAnswerCache.unsubscribe(cacheKey, listener)
        }
    }, [booqId, question, start, end])

    return {
        loading,
        answer: answer || undefined,
        error,
    } satisfies {
        loading: boolean,
        answer: string | undefined,
        error: string | null,
    }
}

type CacheInput = { booqId: BooqId, start: BooqPath, end: BooqPath, question: string }
function generateCacheKey({ booqId, start, end, question }: CacheInput) {
    return `${booqId}-${start.join(',')}-${end.join(',')}-${question}`
}

function parseCacheKey(key: string): CacheInput {
    const [booqId, startStr, endStr, question] = key.split('-')
    const start = startStr.split(',').map(c => parseInt(c))
    const end = endStr.split(',').map(c => parseInt(c))
    return { booqId: booqId as BooqId, start, end, question }
}

const streamingAnswerCache = createStreamingCache(async function* (key: string) {
    const { booqId, start, end, question } = parseCacheKey(key)
    const body: AnswerStreamPostBody = { booqId, start, end, question }
    const res = await fetch('/api/copilot/answer/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        throw new Error('Failed to fetch streaming answer')
    }
    const reader = res.body?.getReader()
    if (!reader) {
        throw new Error('No response body')
    }
    const decoder = new TextDecoder()
    while (true) {
        const { done, value } = await reader.read()
        if (done) {
            break
        }

        const chunk = decoder.decode(value, { stream: true })
        if (chunk) {
            yield chunk
        }
    }
})