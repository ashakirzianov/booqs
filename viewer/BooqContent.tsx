import React, { useEffect, useMemo } from 'react'
import { BooqRange, BooqNode } from '@/core'
import { DumbBooqContent, isEventOnContent } from './DumbBooqContent'
import { Augmentation } from './render'

export function BooqContent({
    booqId, nodes, range, augmentations,
    onAugmentationClick,
}: {
    booqId: string,
    nodes: BooqNode[],
    range: BooqRange,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
}) {
    return useMemo(function () {
        return <DumbBooqContent
            booqId={booqId}
            nodes={nodes}
            range={range}
            augmentations={augmentations}
            onAugmentationClick={onAugmentationClick}
        />
    }, [nodes, booqId, range, augmentations, onAugmentationClick])
}

// TODO: remove this
export function useOnBooqClick(callback?: () => void) {
    useEffect(() => {
        if (callback) {
            const actual = (event: Event) => {
                if (isEventOnContent(event)) {
                    callback()
                }
            }
            window.addEventListener('click', actual)
            return () => {
                window.removeEventListener('click', actual)
            }
        }
    }, [callback])
}
