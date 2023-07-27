import React, { useCallback, useMemo } from 'react'
import { BooqPath, BooqRange, BooqNode } from '@/core'
import { useDocumentEvent } from '@/controls/utils'
import { useOnScroll } from './scroll'
import { DumbBooqContent, isEventOnContent } from './DumbBooqContent'
import { Augmentation } from './render'

export function BooqContent({
    booqId, nodes, range, augmentations,
    onAugmentationClick, onScroll, onClick,
}: {
    booqId: string,
    nodes: BooqNode[],
    range: BooqRange,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
    onScroll?: (path: BooqPath) => void,
    onClick?: () => void,
}) {
    useOnScroll(onScroll)
    useOnClick(onClick)
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

function useOnClick(callback?: () => void) {
    const actual = useCallback((event: Event) => {
        if (callback && isEventOnContent(event)) {
            callback()
        }
    }, [callback])
    useDocumentEvent('click', actual)
}
