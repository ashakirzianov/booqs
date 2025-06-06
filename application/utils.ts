'use client'
import { useEffect, useState } from 'react'

export function useIsMounted() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    return mounted
}

export function useIsSmallScreen() {
    const [small, setSmall] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 600px)')
        const listener = () => setSmall(mq.matches)
        mq.addEventListener('change', listener)
        listener()
        return () => mq.removeEventListener('change', listener)
    }, [])
    return small
}

export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timeout)
    }, [value, delay])

    return debouncedValue
}