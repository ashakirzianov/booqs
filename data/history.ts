'use server'
import { addBooqHistory, booqHistoryForUser, removeBooqHistory } from '@/backend/history'
import { booqForId } from '@/backend/booq'
import { BooqId, BooqPath, positionForPath, previewForPath } from '@/core'
import { getUserIdInsideRequest } from './request'

export type ReadingHistoryEntry = {
    booqId: BooqId,
    path: BooqPath,
    text: string,
    booqLength: number,
    position: number,
    lastRead: number,
    title?: string,
    authors?: string[],
    coverSrc?: string,
}

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

const PREVIEW_LENGTH = 500

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
        const booq = await booqForId(booqId as BooqId)
        if (!booq) {
            console.warn(`Booq not found for ID: ${booqId} while fetching history for: ${userId}`)
            return undefined
        }
        const text = previewForPath(booq.nodes, path, PREVIEW_LENGTH)?.trim()?.substring(0, PREVIEW_LENGTH) ?? ''
        const position = positionForPath(booq.nodes, path)
        const authors = booq.metadata.authors.map(author => author.name)
        const length = booq.metadata.length
        const historyEntry: ReadingHistoryEntry = {
            booqId: booqId as BooqId,
            booqLength: length,
            text,
            position,
            path,
            lastRead: date,
            authors,
            title: booq.metadata.title,
            coverSrc: booq.metadata.coverSrc,
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