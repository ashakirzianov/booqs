'use client'

import { BooqId } from '@/core'
import { useState, useCallback, useRef } from 'react'
import { useSWRConfig } from 'swr'

export type GenerateReplyState =
    | { status: 'idle' }
    | { status: 'streaming', noteId: string, answer: string }
    | { status: 'done', noteId: string, answer: string }
    | { status: 'error', noteId: string, error: string }

export function useGenerateReply({
    booqId,
}: {
    booqId: BooqId,
}) {
    const [state, setState] = useState<GenerateReplyState>({ status: 'idle' })
    const { mutate } = useSWRConfig()
    const abortRef = useRef<AbortController | undefined>(undefined)

    const generateReply = useCallback((noteId: string) => {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setState({ status: 'streaming', noteId, answer: '' })

        streamAnswer({
            noteId,
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
            async onDone() {
                await mutate(`/api/replies?note_id=${noteId}`)
                mutate(`/api/notes?booq_id=${booqId}`)
                setState(prev =>
                    prev.status === 'streaming'
                        ? { status: 'done', noteId: prev.noteId, answer: prev.answer }
                        : prev
                )
            },
        })
    }, [booqId, mutate])

    return {
        generateReply,
        state,
    }
}

async function streamAnswer({ noteId, signal, onChunk, onError, onDone }: {
    noteId: string,
    signal: AbortSignal,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void,
    onDone: () => void,
}) {
    try {
        const res = await fetch(`/api/generate-reply/${noteId}`, {
            method: 'POST',
            signal,
        })
        if (!res.ok) {
            onError('Failed to generate reply')
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
