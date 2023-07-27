import { useCallback, useEffect } from 'react'
import { throttle } from 'lodash'
import { BooqPath } from '@/core'
import { pathFromId } from '@/application'

export function useOnBooqScroll(callback?: (path: BooqPath) => void) {
    useEffect(() => {
        if (callback) {
            const handleScroll = throttle(function () {
                const path = getCurrentPath()
                if (path) {
                    callback(path)
                }
            }, 500)
            window.addEventListener('scroll', handleScroll)
            return () => window.removeEventListener('scroll', handleScroll)
        }
    }, [callback])
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