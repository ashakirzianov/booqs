import { useMemo } from 'react'
import { BooqChapter, BooqMetadata, BooqPath, positionForPath } from '@/core'
import { pageForPosition } from '@/application/common'

export function usePageData({
    chapter, meta, currentPath,
}: {
    chapter: BooqChapter,
    meta: BooqMetadata,
    currentPath: BooqPath,
}) {
    const { fragment, next } = chapter
    const length = meta.length

    return useMemo(() => {
        const position = positionForPath(fragment.nodes, currentPath)
        const nextChapter = next
            ? positionForPath(fragment.nodes, next.path)
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
    }, [fragment, next, length, currentPath])
}