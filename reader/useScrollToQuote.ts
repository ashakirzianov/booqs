import { useEffect, useRef } from 'react'
import { BooqRange, pathToId } from '@/core'

export function useScrollToQuote(quote?: BooqRange) {
    const quoteRef = useRef(quote)
    
    useEffect(() => {
        if (quoteRef.current) {
            const id = pathToId(quoteRef.current.start)
            const element = document.getElementById(id)
            if (element) {
                element.scrollIntoView({
                    behavior: 'instant',
                })
            }
        }
    }, [quoteRef])
}