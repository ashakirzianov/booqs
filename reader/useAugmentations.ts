import { useMemo, useCallback } from 'react'
import { resolveNoteColor, quoteColor } from '@/application/common'
import { getAugmentationText, Augmentation } from '@/viewer'
import { BooqNote, BooqRange } from '@/core'
import { ContextMenuTarget } from './ContextMenuContent'

export function useAugmentations({
    quote, notes,
}: {
    notes: BooqNote[],
    quote?: BooqRange,
}) {
    const augmentations = useMemo(function () {
        const augmentations = notes.map<Augmentation>(function (note) {
            return {
                id: noteAugmentationId(note),
                range: note.range,
                color: resolveNoteColor(note.color),
            }
        })
        if (quote) {
            const quoteAugmentation: Augmentation = {
                range: quote,
                color: quoteColor,
                id: quoteAugmentationId(),
            }
            return [quoteAugmentation, ...augmentations]
        } else {
            return augmentations
        }
    }, [quote, notes])
    const menuTargetForAugmentation = useCallback(function (augmentationId: string): ContextMenuTarget | undefined {
        const [kind, id] = augmentationId.split('/')
        switch (kind) {
            case 'quote':
                return quote
                    ? {
                        kind: 'quote',
                        selection: {
                            range: quote,
                            text: getAugmentationText(augmentationId),
                        },
                    }
                    : undefined
            case 'note': {
                const note = notes.find(function (hl) { return hl.id === id })
                return note
                    ? {
                        kind: 'note',
                        note,
                    }
                    : undefined
            }
            default:
                return undefined
        }
    }, [quote, notes])
    return {
        augmentations,
        menuTargetForAugmentation,
    }
}

export function noteAugmentationId(note: BooqNote): string {
    return `note/${note.id}`
}

export function quoteAugmentationId(): string {
    return 'quote/0'
}