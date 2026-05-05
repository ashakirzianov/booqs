import { useMemo, useCallback } from 'react'
import { getAugmentationText, Augmentation } from '@/viewer'
import { BooqRange } from '@/core'
import { augmentationForAnnotation, COMMENT_KIND, QUESTION_KIND } from '@/application/annotations'
import { MenuState } from './ContextMenuContent'
import { BooqAnnotation } from '@/data/annotations'

export type TemporaryAugmentation = {
    range: BooqRange,
    name: string,
    color?: string,
    underline?: 'dashed' | 'solid',
}

export function useAugmentations({
    quote, annotations, temporaryAugmentations = [],
}: {
    annotations: BooqAnnotation[],
    quote?: BooqRange,
    temporaryAugmentations?: TemporaryAugmentation[],
}) {
    const augmentations = useMemo(function () {
        const annotationAugmentations = annotations.map<Augmentation>(augmentationForAnnotation)

        const tempAugmentations = temporaryAugmentations.map<Augmentation>(function (temp) {
            return {
                id: temporaryAugmentationId(temp.name),
                range: temp.range,
                color: temp.color,
                underline: temp.underline,
            }
        })

        let result = [...annotationAugmentations, ...tempAugmentations]

        if (quote) {
            const quoteAugmentation: Augmentation = {
                range: quote,
                color: 'var(--color-quote)',
                id: quoteAugmentationId(),
            }
            result = [quoteAugmentation, ...result]
        }

        return result
    }, [quote, annotations, temporaryAugmentations])
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
            case 'annotation': {
                const annotation = annotations.find(function (a) { return a.id === id })
                if (!annotation) return undefined
                if (annotation.kind === COMMENT_KIND || annotation.kind === QUESTION_KIND) {
                    return {
                        kind: 'comment',
                        commentId: annotation.id,
                    }
                }
                return {
                    kind: 'annotation',
                    annotationId: annotation.id,
                    selection: {
                        range: annotation.range,
                        text: annotation.targetQuote,
                    },
                }
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
    }, [quote, annotations, temporaryAugmentations])
    return {
        augmentations,
        menuTargetForAugmentation,
    }
}

export function annotationAugmentationId(annotationId: string): string {
    return `annotation/${annotationId}`
}

export function quoteAugmentationId(): string {
    return 'quote/0'
}

export function temporaryAugmentationId(name: string): string {
    return `temp/${name}`
}
