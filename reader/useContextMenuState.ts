'use client'
import { useCallback, useMemo, useState } from 'react'
import { getAugmentationElement, getSelectionElement, VirtualElement } from '@/viewer'
import { ContextMenuTarget } from './ContextMenuContent'
import { noteAugmentationId, quoteAugmentationId, TemporaryAugmentation, temporaryAugmentationId } from './useAugmentations'
import { selectionColor } from '@/application/common'

export type ContextMenuTargetSetter = (setterOrValue: ContextMenuTarget | ((prev: ContextMenuTarget) => ContextMenuTarget)) => void

const CREATE_COMMENT_ID = 'create-comment'
const COPILOT_ID = 'copilot'

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
            if (newAnchor === undefined && (next.kind === 'note' || next.kind === 'create-comment' || next.kind === 'copilot')) {
                setTimeout(() => {
                    setAnchor(getAnchorForTarget(next))
                }, 0)
            } else {
                setAnchor(newAnchor)
            }
            return next
        })
    }, [setTarget])

    const contextMenuAugmentations = useMemo<TemporaryAugmentation[]>(() => {
        const augmentations: TemporaryAugmentation[] = []
        if (target.kind === 'create-comment') {
            augmentations.push({
                // Get the range from the parent target
                range: target.parent.selection.range,
                name: CREATE_COMMENT_ID,
                underline: 'dashed',
            })
        } else if (target.kind === 'copilot') {
            augmentations.push({
                range: target.selection.range,
                name: COPILOT_ID,
                color: selectionColor,
            })
        }
        return augmentations
    }, [target])

    return {
        menuTarget: target,
        setMenuTarget,
        anchor,
        contextMenuAugmentations,
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
            const augmentationId = noteAugmentationId(target.noteId)
            return getAugmentationElement(augmentationId)
        }
        case 'quote': {
            const augmentationId = quoteAugmentationId()
            return getAugmentationElement(augmentationId)
        }
        case 'copilot': {
            const augmentationId = temporaryAugmentationId(COPILOT_ID)
            return getAugmentationElement(augmentationId)
        }
        case 'create-comment': {
            const augmentationId = temporaryAugmentationId(CREATE_COMMENT_ID)
            return getAugmentationElement(augmentationId)
        }
        default:
            return undefined
    }
}

