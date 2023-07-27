import { useEffect, useMemo } from 'react'
import { BooqRange, BooqNode } from '@/core'
import { Augmentation, renderNodes } from './render'
import { pathFromId } from '@/application'

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
        return <div id='booq-root' className='container'>
            {
                renderNodes(nodes, {
                    path: [],
                    booqId, range, augmentations, onAugmentationClick,
                })
            }
        </div>
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
