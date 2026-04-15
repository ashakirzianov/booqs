'use client'
import { useCallback, useMemo, useState } from 'react'
import { getAugmentationElement, getSelectionElement, VirtualElement } from '@/viewer'
import { MenuState } from './ContextMenuContent'
import { noteAugmentationId, quoteAugmentationId, TemporaryAugmentation, temporaryAugmentationId } from './useAugmentations'

export type MenuStateSetter = (setterOrValue: MenuState | ((prev: MenuState) => MenuState)) => void
export type DisplayTarget = 'floater' | 'side-panel' | 'none'

const CREATE_COMMENT_ID = 'create-comment'
const ASK_ID = 'ask'

export function useMenuState() {
    const [anchor, setAnchor] = useState<VirtualElement | undefined>(undefined)
    const [state, setState] = useState<MenuState>({ kind: 'empty' })

    const setMenuState = useCallback<MenuStateSetter>(function (setterOrValue) {
        setState(prev => {
            const next =
                typeof setterOrValue === 'function' ? setterOrValue(prev) : setterOrValue
            if (sameState(prev, next)) {
                return prev
            }
            const newAnchor = getAnchorForState(next)
            if (newAnchor === undefined && (next.kind === 'note' || next.kind === 'create-comment' || next.kind === 'ask')) {
                setTimeout(() => {
                    setAnchor(getAnchorForState(next))
                }, 0)
            } else {
                setAnchor(newAnchor)
            }
            return next
        })
    }, [setState])

    const contextMenuAugmentations = useMemo<TemporaryAugmentation[]>(() => {
        const augmentations: TemporaryAugmentation[] = []
        if (state.kind === 'create-comment') {
            augmentations.push({
                range: state.parent.selection.range,
                name: CREATE_COMMENT_ID,
                underline: 'dashed',
            })
        }
        if (state.kind === 'ask') {
            augmentations.push({
                range: state.selection.range,
                name: ASK_ID,
                color: 'var(--color-selection)',
            })
        }
        return augmentations
    }, [state])

    const displayTarget = useMemo(() => displayTargetForState(state), [state])

    return {
        menuState: state,
        setMenuState,
        anchor,
        contextMenuAugmentations,
        displayTarget,
    }
}

function sameState(a: MenuState, b: MenuState) {
    if (a === b) {
        return true
    }
    if (a.kind === 'empty' && b.kind === 'empty') {
        return true
    }
    if (a.kind === 'selection' && b.kind === 'selection') {
        if (a.selection.text === b.selection.text) {
            return true
        }
    }
    if (a.kind === 'ask' && b.kind === 'ask') {
        if (a.selection.text === b.selection.text) {
            return true
        }
    }
    return false
}

function getAnchorForState(state: MenuState): VirtualElement | undefined {
    switch (state.kind) {
        case 'empty':
            return undefined
        case 'selection':
            return getSelectionElement()
        case 'note': {
            const augmentationId = noteAugmentationId(state.noteId)
            return getAugmentationElement(augmentationId)
        }
        case 'quote': {
            const augmentationId = quoteAugmentationId()
            return getAugmentationElement(augmentationId)
        }
        case 'create-comment': {
            const augmentationId = temporaryAugmentationId(CREATE_COMMENT_ID)
            return getAugmentationElement(augmentationId)
        }
        case 'ask': {
            const augmentationId = temporaryAugmentationId(ASK_ID)
            return getAugmentationElement(augmentationId)
        }
        default:
            return undefined
    }
}

function displayTargetForState(state: MenuState): DisplayTarget {
    switch (state.kind) {
        case 'empty':
            return 'none'
        case 'ask':
            return 'floater'
        default:
            return 'floater'
    }
}
