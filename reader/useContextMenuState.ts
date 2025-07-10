'use client'
import { useCallback, useState } from 'react'
import { VirtualElement } from '@/viewer'
import { ContextMenuTarget } from './ContextMenuContent'

export type ContextMenuState = {
    target: ContextMenuTarget,
    anchor?: VirtualElement,
}
export type ContextMenuStateSetter = (setterOrValue: ContextMenuState | ((prev: ContextMenuState) => ContextMenuState)) => void

export function useContextMenuState() {
    const [menuState, setMenuState] = useState<ContextMenuState>({
        target: { kind: 'empty' },
    })

    const updateMenuState = useCallback<ContextMenuStateSetter>(function (setterOrValue) {
        setMenuState(prev => {
            const next =
                typeof setterOrValue === 'function' ? setterOrValue(prev) : setterOrValue
            if (sameState(prev, next)) {
                return prev
            }
            return next
        })
    }, [setMenuState])

    return {
        setMenuState: updateMenuState,
        menuState,
    }
}

function sameState(a: ContextMenuState, b: ContextMenuState) {
    if (a.target.kind === 'empty' && b.target.kind === 'empty' && a.anchor === b.anchor) {
        return true
    }
    if (a.target.kind === 'selection' && b.target.kind === 'selection') {
        if (a.target.selection.text === b.target.selection.text) {
            return true
        }
    }
    return false
}

