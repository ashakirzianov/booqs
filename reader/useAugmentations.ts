import { useMemo, useCallback } from 'react'
import { resolveNoteColor, quoteColor } from '@/application/common'
import { getAugmentationElement, getAugmentationText, Augmentation } from '@/viewer'
import { BooqNote, BooqRange } from '@/core'
import { ContextMenuState } from './ContextMenu'

export function useAugmentations({
    quote, notes,
}: {
    notes: BooqNote[],
    quote?: BooqRange,
}) {
    const augmentations = useMemo(function () {
        const augmentations = notes.map<Augmentation>(function (note) {
            return {
                id: `note/${note.id}`,
                range: note.range,
                color: resolveNoteColor(note.color),
            }
        })
        if (quote) {
            const quoteAugmentation: Augmentation = {
                range: quote,
                color: quoteColor,
                id: 'quote/0',
            }
            return [quoteAugmentation, ...augmentations]
        } else {
            return augmentations
        }
    }, [quote, notes])
    const menuStateForAugmentation = useCallback(function (augmentationId: string): ContextMenuState | undefined {
        const anchor = getAugmentationElement(augmentationId)
        if (!anchor) {
            return undefined
        }
        const [kind, id] = augmentationId.split('/')
        switch (kind) {
            case 'quote':
                return quote
                    ? {
                        anchor,
                        target: {
                            kind: 'quote',
                            selection: {
                                range: quote,
                                text: getAugmentationText('quote/0'),
                            },
                        },
                    }
                    : undefined
            case 'note': {
                const note = notes.find(function (hl) { return hl.id === id })
                return note
                    ? {
                        anchor,
                        target: {
                            kind: 'note',
                            note,
                        }
                    }
                    : undefined
            }
            default:
                return undefined
        }
    }, [quote, notes])
    return {
        augmentations,
        menuStateForAugmentation,
    }
} 