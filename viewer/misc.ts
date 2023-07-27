'use client'
import { pathFromId } from '@/core'
import { useEffect } from 'react'
import { BooqContentID } from './BooqContent'

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
    const id: string | undefined = (event.target as any).id
    if (id === undefined) {
        return false
    }
    const path = pathFromId(id)
    if (path) {
        return true
    }
    return id === BooqContentID
}