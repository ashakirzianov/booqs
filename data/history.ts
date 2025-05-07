import { booqHistoryForUser } from '@/backend/history'
import { getUserIdInsideRequest } from './auth'
import { filterUndefined } from '@/core'
import { booqPreview } from '@/backend/booq'

export async function fetchReadingHistory() {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const history = await booqHistoryForUser(userId)
    const promises = history.map(async entry => {
        return booqPreview(entry.booqId, entry.path)
    })
    const resolved = await Promise.all(promises)
    return filterUndefined(resolved)
}