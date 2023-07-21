import React, { useCallback, useMemo } from 'react'
import { BooqPath, BooqRange, BooqNode } from '@/core'
import { pathFromId } from '@/application'
import { useDocumentEvent } from '@/controls/utils'
import { renderNodes } from './render'
import { useOnScroll } from './scroll'

export type BooqSelection = {
    range: BooqRange,
    text: string,
};
export type Augmentation = {
    range: BooqRange,
    id: string,
    color?: string,
};
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
        return <div id='booq-root' className='container'>
            {
                renderNodes(nodes, {
                    path: [],
                    booqId, range, augmentations, onAugmentationClick,
                })
            }
        </div>
    }, [nodes, booqId, range, augmentations])
}

function useOnClick(callback?: () => void) {
    const actual = useCallback((event: Event) => {
        if (callback && isEventOnContent(event)) {
            callback()
        }
    }, [callback])
    useDocumentEvent('click', actual)
}

function isEventOnContent(event: Event): boolean {
    const id: string | undefined = (event.target as any).id
    if (id === undefined) {
        return false
    }
    const path = pathFromId(id)
    if (path) {
        return true
    }
    return id === 'booq-root'
}
