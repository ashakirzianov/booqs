import { useMemo } from 'react'
import { Augmentation, renderNodes } from './render'
import { BooqNode, BooqPath, BooqRange } from '@/core'

export const BooqContentID = 'booq-root'
export function BooqContent({
    booqId, nodes, range, augmentations,
    onAugmentationClick, hrefForPath,
}: {
    booqId: string,
    nodes: BooqNode[],
    range: BooqRange,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
    hrefForPath?: (booqId: string, path: BooqPath) => string,
}) {
    return useMemo(function () {
        return <div id={BooqContentID} className='container'>
            {
                renderNodes(nodes, {
                    path: [],
                    booqId, range, augmentations, onAugmentationClick,
                    hrefForPath,
                })
            }
        </div>
    }, [nodes, booqId, range, augmentations, onAugmentationClick, hrefForPath])
}
