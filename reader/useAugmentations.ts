import { useMemo, useCallback } from 'react'
import { getAugmentationText, Augmentation } from '@/viewer'
import { BooqRange } from '@/core'
import { ContextMenuTarget } from './ContextMenuContent'
import { BooqNote } from '@/data/notes'

export type TemporaryAugmentation = {
    range: BooqRange,
    name: string,
    color?: string,
    underline?: 'dashed' | 'solid',
}

export function useAugmentations({
    quote, highlights, comments = [], temporaryAugmentations = [],
}: {
    highlights: BooqNote[] | undefined,
    comments?: BooqNote[],
    quote?: BooqRange,
    temporaryAugmentations?: TemporaryAugmentation[],
}) {
    const augmentations = useMemo(function () {
        const noteArray = highlights ?? []
        const noteAugmentations = noteArray.map<Augmentation>(function (note) {
            return {
                id: noteAugmentationId(note.id),
                range: note.range,
                color: `var(--color-${note.kind})`,
            }
        })

        const tempAugmentations = temporaryAugmentations.map<Augmentation>(function (temp) {
            return {
                id: temporaryAugmentationId(temp.name),
                range: temp.range,
                color: temp.color,
                underline: temp.underline,
            }
        })

        // Create a Set of note IDs for efficient lookup
        const noteIds = new Set(noteArray.map(note => note.id))

        // Generate dashed augmentations for comments not present in notes
        const commentAugmentations = comments
            .filter(comment => !noteIds.has(comment.id))
            .map<Augmentation>(function (comment) {
                return {
                    id: noteAugmentationId(comment.id),
                    range: comment.range,
                    underline: 'dashed',
                }
            })

        let result = [...noteAugmentations, ...commentAugmentations, ...tempAugmentations]

        if (quote) {
            const quoteAugmentation: Augmentation = {
                range: quote,
                color: 'var(--color-quote)',
                id: quoteAugmentationId(),
            }
            result = [quoteAugmentation, ...result]
        }

        return result
    }, [quote, highlights, comments, temporaryAugmentations])
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
                const note = highlights?.find(function (hl) { return hl.id === id }) ||
                    comments.find(function (hl) { return hl.id === id })
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
    }, [quote, highlights, comments, temporaryAugmentations])
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