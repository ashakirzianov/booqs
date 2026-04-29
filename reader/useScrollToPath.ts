import { useEffect } from 'react'
import { BooqPath, pathToString } from '@/core'

export function useScrollToPath(path?: BooqPath) {
    useEffect(() => {
        if (!path) return
        const pathStr = pathToString(path)
        // Delay to ensure the content is rendered before scrolling
        requestAnimationFrame(() => {
            const element = document.querySelector(`[data-booqs-path="${pathStr}"]`)
            if (element) {
                element.scrollIntoView({
                    behavior: 'instant',
                })
            }
        })
    }, [path])
}
