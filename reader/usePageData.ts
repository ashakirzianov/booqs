import { useMemo } from 'react'
import { BooqFragment, BooqMetadata, BooqPath, positionForPath } from '@/core'
import { pageForPosition } from '@/application/common'

export function usePageData({
    fragment, meta, currentPath,
}: {
    fragment: BooqFragment,
    meta: BooqMetadata,
    currentPath: BooqPath,
}) {
    const { nodes, next } = fragment
    const length = meta.length

    return useMemo(() => {
        const position = positionForPath(nodes, currentPath)
        const nextChapter = next
            ? positionForPath(nodes, next.path)
            : length
        const currentPage = pageForPosition(position) + 1
        const totalPages = pageForPosition(length)
        const chapter = pageForPosition(nextChapter)
        const leftPages = chapter - currentPage + 1
        return {
            currentPage,
            totalPages,
            leftPages,
        }
    }, [nodes, next, length, currentPath])
}