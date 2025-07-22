'use client'
import { useCallback, useState, useMemo } from 'react'
import { getAugmentationElement, getSelectionElement, VirtualElement } from '@/viewer'
import { ContextMenuTarget } from './ContextMenuContent'
import { noteAugmentationId, quoteAugmentationId, temporaryAugmentationId } from './useAugmentations'
import { BooqRange } from '@/core'

export type ContextMenuTargetSetter = (setterOrValue: ContextMenuTarget | ((prev: ContextMenuTarget) => ContextMenuTarget)) => void
export const MENU_ANCHOR_ID = 'menu-anchor'

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
            if (newAnchor === undefined && (next.kind === 'note' || next.kind === 'comment' || next.kind === 'copilot')) {
                setTimeout(() => {
                    setAnchor(getAnchorForTarget(next))
                }, 0)
            } else {
                setAnchor(newAnchor)
            }
            return next
        })
    }, [setTarget])

    const anchorRange = useMemo<BooqRange | undefined>(() => {
        if (target.kind === 'comment') {
            // Get the range from the parent target
            const parentRange = target.parent.kind === 'selection' || target.parent.kind === 'quote'
                ? target.parent.selection.range
                : target.parent.kind === 'note'
                    ? target.parent.note.range
                    : undefined

            if (parentRange) {
                return parentRange
            }
        }
        if (target.kind === 'copilot') {
            return target.selection.range
        }
        return undefined
    }, [target])

    return {
        menuTarget: target,
        setMenuTarget,
        anchor,
        anchorRange,
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
        case 'copilot':
        case 'comment': {
            const augmentationId = temporaryAugmentationId(MENU_ANCHOR_ID)
            return getAugmentationElement(augmentationId)
        }
        default:
            return undefined
    }
}

