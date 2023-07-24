import { BooqRange, BooqNode } from '@/core'
import { pathFromId } from '@/application'
import { Augmentation, renderNodes } from './render'

export function DumbBooqContent({
    booqId, nodes, range, augmentations,
    onAugmentationClick,
}: {
    booqId: string,
    nodes: BooqNode[],
    range: BooqRange,
    augmentations: Augmentation[],
    onAugmentationClick?: (id: string) => void,
}) {
    return <div id='booq-root' className='container'>
        {
            renderNodes(nodes, {
                path: [],
                booqId, range, augmentations, onAugmentationClick,
            })
        }
    </div>
}

export function isEventOnContent(event: Event): boolean {
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
