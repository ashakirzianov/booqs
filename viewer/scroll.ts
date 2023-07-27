'use client'
import { useEffect } from 'react'
import { BooqPath, pathFromId } from '@/core'

export type BooqScrollContext = {
    getCurrentPath?: () => BooqPath | undefined,
}
export function useOnBooqScroll(callback?: (path: BooqPath) => void, options?: {
    throttle?: number,
}) {
    useEffect(() => {
        if (callback) {
            let handleScroll = function () {
                const path = getCurrentPath()
                if (path) {
                    callback(path)
                }
            }
            if (options?.throttle) {
                handleScroll = throttle(handleScroll, options.throttle)
            }
            window.addEventListener('scroll', handleScroll)
            return () => window.removeEventListener('scroll', handleScroll)
        }
    }, [callback, options?.throttle])
}

function getCurrentPath() {
    const root = window.document.getElementById('booq-root')
    const current = root && getCurrent(root)
    return current
        ? pathFromId(current.id)
        : undefined
}

function getCurrent(element: Element): Element | undefined {
    if (!isPartiallyVisible(element)) {
        return undefined
    } else if (element.className === 'booq-pph') {
        return element
    }
    const children = element.children
    for (let idx = 0; idx < children.length; idx++) {
        const child = children.item(idx)
        const current = child && getCurrent(child)
        if (current) {
            return current
        }
    }
    return undefined
}

function isPartiallyVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect()
    if (rect) {
        const { top, height } = rect
        const result = height > 0 && top <= 0 && top + height >= 0
        if (result) {
            return result
        }
    }

    return false
}

function throttle<Args extends any[]>(func: (...args: Args) => void, limit: number): (...args: Args) => void {
    let inThrottle: boolean = false
    return function (...args) {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}