'use client'

import { BooqId, BooqPath } from '@/core'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSWRConfig } from 'swr'
import { CacheEvent, createStreamingCache } from './cache'

export type AskStatus = 'idle' | 'streaming' | 'done' | 'error'

export function useAskQuestion({
    booqId,
}: {
    booqId: BooqId,
}) {
    const [status, setStatus] = useState<AskStatus>('idle')
    const [answer, setAnswer] = useState('')
    const [error, setError] = useState<string | undefined>()
    const [input, setInput] = useState<AskInput | undefined>()
    const { mutate } = useSWRConfig()
    const inputRef = useRef(input)
    inputRef.current = input

    useEffect(() => {
        if (!input) return

        setStatus('streaming')
        setAnswer('')
        setError(undefined)

        function listener(event: CacheEvent<string>) {
            if (event.event === 'chunk') {
                setAnswer(prev => prev + event.chunk)
            } else if (event.event === 'error') {
                setError(event.error)
                setStatus('error')
            } else if (event.event === 'complete') {
                setStatus('done')
                const noteId = inputRef.current?.noteId
                if (noteId) {
                    mutate(`/api/replies?note_id=${noteId}`)
                }
                mutate(`/api/notes?booq_id=${booqId}`)
            }
        }
        askStreamingCache.subscribe(input, listener)
        return () => {
            askStreamingCache.unsubscribe(input, listener)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input])

    const ask = useCallback(({ noteId, start, end, question, targetQuote }: {
        noteId: string,
        start: BooqPath,
        end: BooqPath,
        question: string,
        targetQuote: string,
    }) => {
        setInput({ noteId, booqId, start, end, question, targetQuote })
    }, [booqId])

    return {
        ask,
        status,
        answer: answer || undefined,
        error,
        noteId: input?.noteId,
    }
}

type AskInput = {
    noteId: string,
    booqId: BooqId,
    start: BooqPath,
    end: BooqPath,
    question: string,
    targetQuote: string,
}

const askStreamingCache = createStreamingCache(async function* (input: AskInput) {
    const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    })
    if (!res.ok) {
        throw new Error('Failed to ask question')
    }
    const reader = res.body?.getReader()
    if (!reader) {
        throw new Error('No response body')
    }
    const decoder = new TextDecoder()
    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (chunk) {
            yield chunk
        }
    }
})
