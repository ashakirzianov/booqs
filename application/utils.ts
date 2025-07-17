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

export function generatePasskeyLabel(): string {
    if (typeof navigator === 'undefined') {
        return 'Unknown Browser on Unknown Platform'
    }
    
    const userAgent = navigator.userAgent || 'Unknown'
    
    // Extract browser info from user agent
    let browserInfo = 'Unknown Browser'
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browserInfo = 'Chrome'
    } else if (userAgent.includes('Firefox')) {
        browserInfo = 'Firefox'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserInfo = 'Safari'
    } else if (userAgent.includes('Edg')) {
        browserInfo = 'Edge'
    }
    
    // Extract platform info using userAgentData if available, otherwise parse userAgent
    let platformInfo = 'Unknown Platform'
    
    // Try modern userAgentData API first
    if ('userAgentData' in navigator && (navigator as any).userAgentData) {
        const uaData = (navigator as any).userAgentData
        if (uaData.platform) {
            platformInfo = uaData.platform
        }
    } else {
        // Fallback to parsing userAgent string
        if (userAgent.includes('Windows')) {
            platformInfo = 'Windows'
        } else if (userAgent.includes('Mac')) {
            platformInfo = 'macOS'
        } else if (userAgent.includes('Linux')) {
            platformInfo = 'Linux'
        } else if (userAgent.includes('Android')) {
            platformInfo = 'Android'
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            platformInfo = 'iOS'
        }
    }
    
    return `${browserInfo} on ${platformInfo}`
}