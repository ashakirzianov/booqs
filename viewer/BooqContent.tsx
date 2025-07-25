import { useMemo } from 'react'
import { Augmentation, renderNodes } from './render'
import { BooqId, BooqNode, BooqPath, BooqRange } from '@/core'

export const BooqContentID = 'booq-root'
export function BooqContent({
    booqId, nodes, range, augmentations,
    onAugmentationClick, hrefForPath, resolveSrc,
}: {
    booqId: BooqId,
    nodes: BooqNode[],
    range: BooqRange,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
    hrefForPath?: (booqId: BooqId, path: BooqPath) => string,
    resolveSrc?: (booqId: BooqId, src: string) => string,
}) {
    return useMemo(function () {
        return <div id={BooqContentID} className='container'>
            {
                renderNodes(nodes, {
                    path: [],
                    booqId, range, augmentations, onAugmentationClick,
                    hrefForPath, resolveSrc,
                })
            }
        </div>
    }, [nodes, booqId, range, augmentations, onAugmentationClick, hrefForPath, resolveSrc])
}
