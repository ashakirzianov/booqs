'use client'
import React, { useState, useEffect } from 'react'
import {
    getBooqSelection,
    VirtualElement,
} from '@/viewer'
import { useFloater } from '@/components/Floater'
import { MenuStateSetter } from './useMenuState'
import { isStateDismissable } from './ContextMenuContent'

export function useContextMenuFloater({
    anchor, Content,
    setMenuState,
}: {
    anchor?: VirtualElement,
    Content: React.ReactNode,
    setMenuState: MenuStateSetter,
}) {
    const [locked, setLocked] = useState(false)
    const isOpen = !locked && (Content !== null) && (anchor !== undefined)

    const { FloaterNode, setReference, floating } = useFloater({
        isOpen,
        setIsOpen(open: boolean) {
            if (!open) {
                setMenuState({ kind: 'empty' })
            }
        },
        Content,
    })

    useEffect(() => {
        if (anchor) {
            setReference(anchor)
        }
    }, [anchor, setReference])

    useEffect(() => {
        function handleSelectionChange() {
            setMenuState(prev => {
                if (isStateDismissable(prev)) {
                    const selection = getBooqSelection()
                    if (selection) {
                        return { kind: 'selection', selection }
                    } else if (prev.kind === 'selection') {
                        return { kind: 'empty' }
                    }
                }
                return prev
            })
        }
        function isWithinCtxMenu(event: Event) {
            return floating.current?.contains(event.target as Element | null)
        }
        function lock(event: MouseEvent | TouchEvent) {
            if (!isWithinCtxMenu(event)) {
                setLocked(true)
            }
        }
        function unlock() {
            setLocked(false)
            setTimeout(() => {
                handleSelectionChange()
            }, 150)
        }
        window.document.addEventListener('mousedown', lock)
        window.document.addEventListener('touchstart', lock)
        window.document.addEventListener('mouseup', unlock)
        window.document.addEventListener('touchend', unlock)
        window.document.addEventListener('mouseleave', unlock)
        window.document.addEventListener('touchcancel', unlock)
        window.document.addEventListener('selectionchange', handleSelectionChange)
        return () => {
            window.document.removeEventListener('mousedown', lock)
            window.document.removeEventListener('touchstart', lock)
            window.document.removeEventListener('mouseup', unlock)
            window.document.removeEventListener('touchend', unlock)
            window.document.removeEventListener('mouseleave', unlock)
            window.document.removeEventListener('touchcancel', unlock)
            window.document.removeEventListener('selectionchange', handleSelectionChange)
        }
    }, [setMenuState, setLocked, floating])

    return {
        ContextMenuNode: FloaterNode,
    }
}

