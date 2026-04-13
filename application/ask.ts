'use client'

import { BooqId, BooqPath } from '@/core'
import { useState, useCallback, useRef } from 'react'
import { useSWRConfig } from 'swr'

export type AskStatus = 'idle' | 'streaming' | 'done' | 'error'

export function useAskQuestion({
    booqId,
}: {
    booqId: BooqId,
}) {
    const [status, setStatus] = useState<AskStatus>('idle')
    const [answer, setAnswer] = useState('')
    const [error, setError] = useState<string | undefined>()
    const [activeNoteId, setActiveNoteId] = useState<string | undefined>()
    const { mutate } = useSWRConfig()
    const abortRef = useRef<AbortController | undefined>(undefined)

    const ask = useCallback(({ noteId, start, end, question, targetQuote }: {
        noteId: string,
        start: BooqPath,
        end: BooqPath,
        question: string,
        targetQuote: string,
    }) => {
        // Abort any in-flight request
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setActiveNoteId(noteId)
        setStatus('streaming')
        setAnswer('')
        setError(undefined)

        streamAnswer({
            body: { noteId, booqId, start, end, question, targetQuote },
            signal: controller.signal,
            onChunk(chunk) {
                setAnswer(prev => prev + chunk)
            },
            onError(err) {
                setError(err)
                setStatus('error')
            },
            onDone() {
                setStatus('done')
                mutate(`/api/replies?note_id=${noteId}`)
                mutate(`/api/notes?booq_id=${booqId}`)
            },
        })
    }, [booqId, mutate])

    return {
        ask,
        status,
        answer: answer || undefined,
        error,
        noteId: activeNoteId,
    }
}

async function streamAnswer({ body, signal, onChunk, onError, onDone }: {
    body: object,
    signal: AbortSignal,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void,
    onDone: () => void,
}) {
    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal,
        })
        if (!res.ok) {
            onError('Failed to ask question')
            return
        }
        const reader = res.body?.getReader()
        if (!reader) {
            onError('No response body')
            return
        }
        const decoder = new TextDecoder()
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            if (chunk) {
                onChunk(chunk)
            }
        }
        onDone()
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        onError(err instanceof Error ? err.message : 'Unknown error')
    }
}
