'use client'

import type { PostBody as SuggestionsPostBody, PostResponse as SuggestionsPostResponse } from '@/app/api/copilot/suggestions/route'
import type { PostBody as AnswerPostBody, PostResponse as AnswerPostResponse } from '@/app/api/copilot/answer/route'
import type { PostBody as AnswerStreamPostBody } from '@/app/api/copilot/answer/stream/route'
import { BooqId, BooqPath } from '@/core'
import useSWR from 'swr'
import { useState, useEffect } from 'react'

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
    const [state, setState] = useState<CacheState>({
        answer: '',
        loading: true,
        error: null,
    })

    useEffect(() => {
        const key = `${booqId}-${start.join(',')}-${end.join(',')}-${question}`
        streamingCache.subscribe(
            key,
            setState,
            async () => {
                const body: AnswerStreamPostBody = { booqId, start, end, question }
                const res = await fetch('/api/copilot/answer/stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                })
                return res
            })

        return () => {
            streamingCache.unsubscribe(key, setState)
        }
    }, [booqId, question, start, end])

    return {
        loading: state.loading,
        answer: state.answer || undefined,
        error: state.error,
    } satisfies {
        loading: boolean,
        answer: string | undefined,
        error: string | null,
    }
}

type CacheState = {
    answer: string,
    loading: boolean,
    error: string | null,
}
type CacheStateSetter = (setterOrValue: CacheState | ((prev: CacheState) => CacheState)) => void
type CacheValue = {
    current: CacheState,
    setters: Set<CacheStateSetter>,
}
type CacheFetcher = () => Promise<Response>
function createStreamingCache() {
    const cache = new Map<string, CacheValue>()
    function notify(value: CacheValue) {
        for (const setter of value.setters) {
            setter({ ...value.current })
        }
    }
    return {
        async subscribe(key: string, setter: CacheStateSetter, fetcher: CacheFetcher) {
            let value = cache.get(key)
            if (value) {
                value.setters.add(setter)
                setter({ ...value.current })
                return
            }
            value = {
                current: { answer: '', loading: true, error: null },
                setters: new Set([setter]),
            }
            cache.set(key, value)

            try {
                const response = await fetcher()
                if (!response.ok) {
                    throw new Error('Failed to fetch streaming answer')
                }

                const reader = response.body?.getReader()
                if (!reader) {
                    throw new Error('No response body')
                }

                const decoder = new TextDecoder()

                while (true) {
                    const { done, value: chunk } = await reader.read()
                    if (done) break

                    const text = decoder.decode(chunk, { stream: true })
                    value.current.answer += text

                    notify(value)
                }

                value.current.loading = false
            } catch (error) {
                value.current.error = error instanceof Error ? error.message : 'Unknown error'
                value.current.loading = false
            } finally {
                notify(value)
            }
        },
        async unsubscribe(key: string, setter: CacheStateSetter) {
            const value = cache.get(key)
            if (value) {
                value.setters.delete(setter)
            }
        },
    }
}

const streamingCache = createStreamingCache()
