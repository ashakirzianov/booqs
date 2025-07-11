import { useMemo, useCallback } from 'react'
import { resolveNoteColor, quoteColor, temporaryColor } from '@/application/common'
import { getAugmentationText, Augmentation } from '@/viewer'
import { BooqNote, BooqRange } from '@/core'
import { ContextMenuTarget } from './ContextMenuContent'
import { TemporaryAugmentation } from './useContextMenuState'

export function useAugmentations({
    quote, notes, temporaryAugmentations = [],
}: {
    notes: BooqNote[],
    quote?: BooqRange,
    temporaryAugmentations?: TemporaryAugmentation[],
}) {
    const augmentations = useMemo(function () {
        const noteAugmentations = notes.map<Augmentation>(function (note) {
            return {
                id: noteAugmentationId(note),
                range: note.range,
                color: resolveNoteColor(note.color),
            }
        })
        
        const tempAugmentations = temporaryAugmentations.map<Augmentation>(function (temp) {
            return {
                id: temporaryAugmentationId(temp.name),
                range: temp.range,
                color: temporaryColor,
            }
        })
        
        let result = [...tempAugmentations, ...noteAugmentations]
        
        if (quote) {
            const quoteAugmentation: Augmentation = {
                range: quote,
                color: quoteColor,
                id: quoteAugmentationId(),
            }
            result = [quoteAugmentation, ...result]
        }
        
        return result
    }, [quote, notes, temporaryAugmentations])
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
            case 'temp': {
                const temp = temporaryAugmentations.find(function (ta) { return ta.name === id })
                return temp
                    ? {
                        kind: 'selection',
                        selection: {
                            range: temp.range,
                            text: getAugmentationText(augmentationId),
                        },
                    }
                    : undefined
            }
            default:
                return undefined
        }
    }, [quote, notes, temporaryAugmentations])
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

export function temporaryAugmentationId(name: string): string {
    return `temp/${name}`
}