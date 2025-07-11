'use client'
import { useCallback, useState, useMemo } from 'react'
import { getAugmentationElement, getSelectionElement, VirtualElement } from '@/viewer'
import { ContextMenuTarget } from './ContextMenuContent'
import { noteAugmentationId, quoteAugmentationId, temporaryAugmentationId } from './useAugmentations'
import { BooqRange } from '@/core'

export type TemporaryAugmentation = {
    range: BooqRange,
    name: string,
}

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
            if (newAnchor === undefined && (next.kind === 'note' || next.kind === 'comment')) {
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

    const temporaryAugmentations = useMemo<TemporaryAugmentation[]>(() => {
        if (target.kind === 'comment') {
            // Get the range from the parent target
            const parentRange = target.parent.kind === 'selection' || target.parent.kind === 'quote' 
                ? target.parent.selection.range
                : target.parent.kind === 'note' 
                    ? target.parent.note.range
                    : undefined
            
            if (parentRange) {
                return [{
                    range: parentRange,
                    name: 'comment',
                }]
            }
        }
        return []
    }, [target])

    return {
        menuTarget: target,
        setMenuTarget,
        anchor,
        temporaryAugmentations,
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
        case 'comment': {
            const augmentationId = temporaryAugmentationId('comment')
            return getAugmentationElement(augmentationId)
        }
        default:
            return undefined
    }
}

