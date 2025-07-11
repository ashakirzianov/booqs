'use client'
import { useEffect, useState } from 'react'
import { BooqPath, pathFromId } from '@/core'

export function useHashPath(): BooqPath | undefined {
    const [hashPath, setHashPath] = useState<BooqPath | undefined>(undefined)

    useEffect(() => {
        const updateHashPath = () => {
            const hash = window.location.hash
            if (hash.startsWith('#')) {
                const id = hash.substring(1)
                const path = pathFromId(id)
                setHashPath(path)
            } else {
                setHashPath(undefined)
            }
        }

        // Initial check
        updateHashPath()

        // Listen for hash changes
        window.addEventListener('hashchange', updateHashPath)

        return () => {
            window.removeEventListener('hashchange', updateHashPath)
        }
    }, [])

    return hashPath
}