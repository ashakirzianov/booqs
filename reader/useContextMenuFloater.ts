'use client'
import React, { useState, useEffect } from 'react'
import {
    getBooqSelection, getSelectionElement,
    VirtualElement,
} from '@/viewer'
import { useFloater } from '@/components/Floater'
import { ContextMenuState, ContextMenuStateSetter } from './useContextMenuState'

export function useContextMenuFloater({
    anchor, Content,
    setMenuState,
}: {
    anchor?: VirtualElement,
    Content: React.ReactNode,
    setMenuState: ContextMenuStateSetter,
}) {
    const [locked, setLocked] = useState(false)
    const isOpen = !locked && (Content !== null)

    const { FloaterNode, setReference, floating } = useFloater({
        isOpen,
        setIsOpen(open: boolean) {
            if (!open) {
                setMenuState({ target: { kind: 'empty' } })
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
                if (prev.target.kind === 'empty' || prev.target.kind === 'selection') {
                    return getSelectionState()
                } else {
                    return prev
                }
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

function getSelectionState(): ContextMenuState {
    const element = getSelectionElement()
    if (element) {
        const selection = getBooqSelection()
        if (selection) {
            return {
                anchor: element,
                target: {
                    kind: 'selection',
                    selection,
                },
            }
        }
    }
    return {
        target: { kind: 'empty' },
    }
}

