'use client'
import { useEffect, useState } from 'react'

export function useIsMounted() {
    let [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    return mounted
}