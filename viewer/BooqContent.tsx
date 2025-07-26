import { useMemo } from 'react'
import { Augmentation, renderNodes } from './render'
import { BooqNode, BooqPath, BooqRange } from '@/core'

export const BooqContentID = 'booq-root'
export function BooqContent({
    nodes, range, augmentations,
    onAugmentationClick, hrefForPath, resolveSrc,
}: {
    nodes: BooqNode[],
    range: BooqRange,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
    hrefForPath?: (path: BooqPath) => string,
    resolveSrc?: (src: string) => string,
}) {
    return useMemo(function () {
        return <div id={BooqContentID} className='container'>
            {
                renderNodes(nodes, {
                    path: [],
                    range, augmentations, onAugmentationClick,
                    hrefForPath, resolveSrc,
                })
            }
        </div>
    }, [nodes, range, augmentations, onAugmentationClick, hrefForPath, resolveSrc])
}
