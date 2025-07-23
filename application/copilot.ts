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
    const [loading, setLoading] = useState(false)
    const [answer, setAnswer] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        
        async function streamAnswer() {
            setLoading(true)
            setAnswer('')
            setError(null)

            try {
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
                    if (cancelled) break
                    
                    const { done, value } = await reader.read()
                    if (done) {
                        setLoading(false)
                        break
                    }

                    const chunk = decoder.decode(value, { stream: true })
                    if (chunk && !cancelled) {
                        setAnswer(prev => prev + chunk)
                    }
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'Unknown error')
                    setLoading(false)
                }
            }
        }

        streamAnswer()

        return () => {
            cancelled = true
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