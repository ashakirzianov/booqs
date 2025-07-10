'use client'
import { useCallback, useState } from 'react'
import { getAugmentationElement, getSelectionElement, VirtualElement } from '@/viewer'
import { ContextMenuTarget } from './ContextMenuContent'
import { noteAugmentationId, quoteAugmentationId } from './useAugmentations'

export type ContextMenuTargetSetter = (setterOrValue: ContextMenuTarget | ((prev: ContextMenuTarget) => ContextMenuTarget)) => void

export function useContextMenuState() {
    const [anchor, setAnchor] = useState<VirtualElement | undefined>(undefined)
    const [target, setTarget] = useState<ContextMenuTarget>({ kind: 'empty' })

    const setMenuTarget = useCallback<ContextMenuTargetSetter>(function (setterOrValue) {
        setTarget(prev => {
            const next =
                typeof setterOrValue === 'function' ? setterOrValue(prev) : setterOrValue
            if (sameTarget(prev, next)) {
                return prev
            }
            const newAnchor = getAnchorForTarget(next)
            if (newAnchor === undefined && next.kind === 'note') {
                setAnchor(undefined)
                setTimeout(() => {
                    setAnchor(getAnchorForTarget(next))
                }, 0)
            } else {
                setAnchor(newAnchor)
            }
            return next
        })
    }, [setTarget])

    return {
        menuTarget: target,
        setMenuTarget,
        anchor,
    }
}

function sameTarget(a: ContextMenuTarget, b: ContextMenuTarget) {
    if (a.kind === 'empty' && b.kind === 'empty') {
        return true
    }
    if (a.kind === 'selection' && b.kind === 'selection') {
        if (a.selection.text === b.selection.text) {
            return true
        }
    }
    return false
}

function getAnchorForTarget(target: ContextMenuTarget): VirtualElement | undefined {
    switch (target.kind) {
        case 'empty':
            return undefined
        case 'selection':
            return getSelectionElement()
        case 'note': {
            const augmentationId = noteAugmentationId(target.note)
            return getAugmentationElement(augmentationId)
        }
        case 'quote': {
            const augmentationId = quoteAugmentationId()
            return getAugmentationElement(augmentationId)
        }
        case 'comment':
            return getAnchorForTarget(target.parent)
        default:
            return undefined
    }
}

