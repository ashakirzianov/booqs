'use server'
import { addBooqHistory, booqHistoryForUser, removeBooqHistory } from '@/backend/history'
import { booqPreview } from '@/backend/booq'
import { BooqId, BooqPath } from '@/core'
import { getUserIdInsideRequest } from './request'

export type ReadingHistoryEntry = {
    booqId: BooqId,
    path: BooqPath,
    text: string,
    position: number,
    booqLength: number,
    lastRead: number,
    title?: string,
    authors?: string[],
    coverSrc?: string,
}

export async function reportBooqHistoryAction({
    booqId, path,
}: {
    booqId: BooqId,
    path: BooqPath,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return {
            success: false,
            error: 'Not authenticated',
        } as const
    }
    addBooqHistory(userId, {
        booqId, path,
        date: Date.now(),
    })
}

export type ReadingHistoryResult = {
    entries: ReadingHistoryEntry[]
    total: number
    hasMore: boolean
}

export async function getReadingHistory({
    limit = 20,
    offset = 0,
}: {
    limit?: number
    offset?: number
} = {}): Promise<ReadingHistoryResult | undefined> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const history = await booqHistoryForUser(userId)
    const total = history.length
    const paginatedHistory = history.slice(offset, offset + limit)
    const hasMore = offset + limit < total

    const promises = paginatedHistory.map(async ({ booqId, path, date }) => {
        const preview = await booqPreview(booqId as BooqId, path)
        if (!preview) {
            console.warn(`Booq preview not found for ID: ${booqId} while fetching history for: ${userId}`)
            return undefined
        }
        const historyEntry: ReadingHistoryEntry = {
            booqId: booqId as BooqId,
            path,
            lastRead: date,
            text: preview.text,
            position: preview.position,
            booqLength: preview.booqLength,
            title: preview.title,
            authors: preview.authors,
            coverSrc: preview.coverSrc,
        }
        return historyEntry
    })
    const resolved = await Promise.all(promises)
    const entries = resolved.filter(entry => entry !== undefined)

    return {
        entries,
        total,
        hasMore,
    }
}

export async function removeHistoryEntryAction({
    booqId,
}: {
    booqId: BooqId,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return {
            success: false,
            error: 'Not authenticated',
        } as const
    }

    const success = await removeBooqHistory(userId, booqId)
    return {
        success,
        error: success ? null : 'Failed to remove history entry',
    } as const
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