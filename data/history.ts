import { booqHistoryForUser } from '@/backend/history'
import { getUserIdInsideRequest } from './auth'
import { booqForId } from '@/backend/library'
import { filterUndefined, nodesLength, positionForPath, previewForPath } from '@/core'
import { logTime, logTimeAsync } from '@/backend/utils'

export async function fetchReadingHistory(previewLength: number) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const history = await booqHistoryForUser(userId)
    const promises = history.map(async entry => {
        const booq = await logTimeAsync(
            `history: booq for id ${entry.booqId}`,
            () => booqForId(entry.booqId),
        )
        if (!booq) {
            return undefined
        }
        const preview = logTime(
            `history: preview for path ${entry.path}`,
            () => previewForPath(booq.nodes, entry.path, previewLength),
        )
        const position = logTime(
            `history: position for path ${entry.path}`,
            () => positionForPath(booq.nodes, entry.path),
        )
        const length = nodesLength(booq.nodes)
        return {
            booqId: entry.booqId,
            title: booq.meta.title,
            path: entry.path,
            preview: preview?.trim()?.substring(0, previewLength) ?? '',
            position,
            length,
        }
    })
    const resolved = await Promise.all(promises)
    return filterUndefined(resolved)
}