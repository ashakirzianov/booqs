'use client'
import { useEffect, useState } from 'react'

export function useIsMounted() {
    let [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    return mounted
}

export function useIsSmallScreen() {
    let [small, setSmall] = useState(false)
    useEffect(() => {
        let mq = window.matchMedia('(max-width: 600px)')
        let listener = () => setSmall(mq.matches)
        mq.addEventListener('change', listener)
        listener()
        return () => mq.removeEventListener('change', listener)
    }, [])
    return small
}