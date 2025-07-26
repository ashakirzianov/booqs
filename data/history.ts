'use server'
import { addBooqHistory, booqHistoryForUser } from '@/backend/history'
import { booqPreview } from '@/backend/booq'
import { BooqId, BooqPath } from '@/core'
import { getUserIdInsideRequest } from './request'

export async function reportBooqHistoryAction({
    booqId, path, source,
}: {
    booqId: BooqId,
    path: BooqPath,
    source: string,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return {
            success: false,
            error: 'Not authenticated',
        } as const
    }
    addBooqHistory(userId, {
        booqId, path, source,
        date: Date.now(),
    })
}

export async function getReadingHistory() {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const history = await booqHistoryForUser(userId)
    const promises = history.map(async entry => {
        return booqPreview(entry.booqId as BooqId, entry.path)
    })
    const resolved = await Promise.all(promises)
    return resolved.filter(entry => entry !== undefined)
}

export async function getBooqHistory(booqId: BooqId) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const history = await booqHistoryForUser(userId)
    const booqHistory = history.find(entry => entry.booqId === booqId)
    return booqHistory
}