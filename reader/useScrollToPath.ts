import { useEffect } from 'react'
import { BooqPath, pathToId } from '@/core'

export function useScrollToPath(path?: BooqPath) {
    useEffect(() => {
        if (!path) return
        const id = pathToId(path)
        // Delay to ensure the content is rendered before scrolling
        requestAnimationFrame(() => {
            const element = document.getElementById(id)
            if (element) {
                element.scrollIntoView({
                    behavior: 'instant',
                })
            }
        })
    }, [path])
}