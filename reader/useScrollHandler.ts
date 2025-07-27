import { useState } from 'react'
import { BooqId, BooqPath, samePath } from '@/core'
import { useOnBooqScroll } from '@/viewer'
import { reportBooqHistoryAction } from '@/data/history'

export function useScrollHandler({
    booqId, initialPath,
}: {
    initialPath: BooqPath,
    booqId: BooqId,
}) {
    const [currentPath, setCurrentPath] = useState(initialPath)

    const onScroll = function (path: BooqPath) {
        if (!samePath(path, currentPath)) {
            setCurrentPath(path)
            reportBooqHistoryAction({
                booqId,
                path,
            })
        }
    }

    useOnBooqScroll(onScroll, {
        throttle: 500,
    })

    return {
        currentPath,
    }
}