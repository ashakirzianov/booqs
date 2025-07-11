import { useMemo } from 'react'
import { BooqPath, PartialBooqData, positionForPath } from '@/core'
import { pageForPosition } from '@/application/common'

export function usePageData({
    booq, currentPath,
}: {
    booq: PartialBooqData,
    currentPath: BooqPath,
}) {
    const { fragment: { nodes, next }, meta: { length } } = booq

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