'use client'

import { BooqId, BooqPath } from '@/core'
import { useState, useCallback, useRef } from 'react'
import { useSWRConfig } from 'swr'

export type AskState =
    | { status: 'idle' }
    | { status: 'streaming', noteId: string, answer: string }
    | { status: 'done', noteId: string, answer: string }
    | { status: 'error', noteId: string, error: string }

export function useAskQuestion({
    booqId,
}: {
    booqId: BooqId,
}) {
    const [state, setState] = useState<AskState>({ status: 'idle' })
    const { mutate } = useSWRConfig()
    const abortRef = useRef<AbortController | undefined>(undefined)

    const ask = useCallback(({ noteId, start, end, question, targetQuote }: {
        noteId: string,
        start: BooqPath,
        end: BooqPath,
        question: string,
        targetQuote: string,
    }) => {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setState({ status: 'streaming', noteId, answer: '' })

        streamAnswer({
            body: { noteId, booqId, start, end, question, targetQuote },
            signal: controller.signal,
            onChunk(chunk) {
                setState(prev =>
                    prev.status === 'streaming'
                        ? { ...prev, answer: prev.answer + chunk }
                        : prev
                )
            },
            onError(error) {
                setState({ status: 'error', noteId, error })
            },
            onDone() {
                setState(prev =>
                    prev.status === 'streaming'
                        ? { status: 'done', noteId: prev.noteId, answer: prev.answer }
                        : prev
                )
                mutate(`/api/replies?note_id=${noteId}`)
                mutate(`/api/notes?booq_id=${booqId}`)
            },
        })
    }, [booqId, mutate])

    return {
        ask,
        state,
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
