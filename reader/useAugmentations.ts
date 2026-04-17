import { useMemo, useCallback } from 'react'
import { getAugmentationText, Augmentation } from '@/viewer'
import { BooqRange } from '@/core'
import { augmentationForNote } from '@/application/notes'
import { MenuState } from './ContextMenuContent'
import { BooqNote } from '@/data/notes'

export type TemporaryAugmentation = {
    range: BooqRange,
    name: string,
    color?: string,
    underline?: 'dashed' | 'solid',
}

export function useAugmentations({
    quote, notes, temporaryAugmentations = [],
}: {
    notes: BooqNote[],
    quote?: BooqRange,
    temporaryAugmentations?: TemporaryAugmentation[],
}) {
    const augmentations = useMemo(function () {
        const noteAugmentations = notes.map<Augmentation>(augmentationForNote)

        const tempAugmentations = temporaryAugmentations.map<Augmentation>(function (temp) {
            return {
                id: temporaryAugmentationId(temp.name),
                range: temp.range,
                color: temp.color,
                underline: temp.underline,
            }
        })

        let result = [...noteAugmentations, ...tempAugmentations]

        if (quote) {
            const quoteAugmentation: Augmentation = {
                range: quote,
                color: 'var(--color-quote)',
                id: quoteAugmentationId(),
            }
            result = [quoteAugmentation, ...result]
        }

        return result
    }, [quote, notes, temporaryAugmentations])
    const menuTargetForAugmentation = useCallback(function (augmentationId: string): MenuState | undefined {
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
                const note = notes.find(function (n) { return n.id === id })
                return note
                    ? {
                        kind: 'note',
                        noteId: note.id,
                        selection: {
                            range: note.range,
                            text: note.targetQuote,
                        },
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

export function noteAugmentationId(noteId: string): string {
    return `note/${noteId}`
}

export function quoteAugmentationId(): string {
    return 'quote/0'
}

export function temporaryAugmentationId(name: string): string {
    return `temp/${name}`
}