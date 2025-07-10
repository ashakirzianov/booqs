import { useState } from 'react'
import { BooqPath, PartialBooqData, positionForPath, samePath } from '@/core'
import { useOnBooqScroll } from '@/viewer'
import { reportBooqHistory } from '@/data/user'
import { currentSource, pageForPosition } from '@/application/common'

export function useScrollHandler(booq: PartialBooqData) {
    const { booqId, fragment, meta: { length } } = booq
    const [currentPath, setCurrentPath] = useState(fragment.current.path)

    const position = positionForPath(fragment.nodes, currentPath)
    const nextChapter = fragment.next
        ? positionForPath(fragment.nodes, fragment.next.path)
        : length
    const currentPage = pageForPosition(position) + 1
    const totalPages = pageForPosition(length)
    const chapter = pageForPosition(nextChapter)
    const leftPages = chapter - currentPage + 1

    const onScroll = function (path: BooqPath) {
        if (!samePath(path, currentPath)) {
            setCurrentPath(path)
            reportBooqHistory({
                booqId,
                path,
                source: currentSource(),
            })
        }
    }

    useOnBooqScroll(onScroll, {
        throttle: 500,
    })

    return {
        currentPage,
        totalPages,
        leftPages,
    }
}