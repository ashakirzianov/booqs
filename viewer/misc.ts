'use client'
import { useEffect } from 'react'
import { DATASET_PATH } from '@/core'
import { BOOQ_CONTENT_ID } from './BooqContent'

// TODO: remove this
export function useOnBooqClick(callback?: () => void) {
    useEffect(() => {
        if (callback) {
            const actual = (event: Event) => {
                if (isEventOnContent(event)) {
                    callback()
                }
            }
            window.addEventListener('click', actual)
            return () => {
                window.removeEventListener('click', actual)
            }
        }
    }, [callback])
}

function isEventOnContent(event: Event): boolean {
    const target = event.target as HTMLElement
    if (target.dataset?.[DATASET_PATH]) {
        return true
    }
    return target.id === BOOQ_CONTENT_ID
}
