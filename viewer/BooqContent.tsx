import { useEffect, useMemo } from 'react'
import { Augmentation, renderNodes } from './render'
import { BooqNode, BooqPath, BooqRange, pathFromId } from '@/core'

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
        return <div id='booq-root' className='container'>
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
