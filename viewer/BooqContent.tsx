import { useMemo } from 'react'
import { Augmentation, renderNodes } from './render'
import { BooqNode, BooqStyles, BooqPath, BooqRange } from '@/core'

export const BOOQ_CONTENT_ID = 'booqs-content-container'
export default function BooqContent({
    nodes, styles, range, augmentations,
    onAugmentationClick, hrefForPath,
}: {
    nodes: BooqNode[],
    styles: BooqStyles,
    range: BooqRange,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
    hrefForPath?: (path: BooqPath) => string,
}) {
    return useMemo(function () {
        return <div id={BOOQ_CONTENT_ID} className='container'>
            {
                renderNodes(nodes, {
                    path: [],
                    styles, range, augmentations, onAugmentationClick,
                    hrefForPath,
                })
            }
        </div>
    }, [nodes, styles, range, augmentations, onAugmentationClick, hrefForPath])
}
