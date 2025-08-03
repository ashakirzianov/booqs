'use server'
import { addBooqHistory, booqHistoryForUser, removeBooqHistory, DbReadingHistoryEvent } from '@/backend/history'
import { booqDataForIds, booqPreview } from '@/backend/library'
import { BooqId, BooqPath } from '@/core'
import { getUserIdInsideRequest } from './request'
import { BooqCoverData } from './booqs'
import { getUrlAndDimensions } from '@/backend/images'

export type ReadingHistoryEntry = BriefReadingHistoryEntry | DetailedReadingHistoryEntry
// Brief entry for history page - just book info and read time
export type BriefReadingHistoryEntry = {
    booqId: BooqId,
    path: BooqPath,
    lastRead: number,
    title: string,
    authors: string[],
    cover?: BooqCoverData,
}

// Detailed entry for main page - includes reading position and preview
export type DetailedReadingHistoryEntry = BriefReadingHistoryEntry & {
    text: string,
    position: number,
    booqLength: number,
}

export type ReadingHistoryResult = {
    entries: ReadingHistoryEntry[]
    total: number
    hasMore: boolean
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

export async function hasReadingHistory(userId?: string): Promise<boolean> {
    if (!userId) {
        return false
    }
    const history = await booqHistoryForUser(userId)
    return history.length > 0
}

export async function getReadingHistoryForMainPage({
    limit = 5,
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

    if (paginatedHistory.length === 0) {
        return {
            entries: [],
            total,
            hasMore,
        }
    }

    // Get detailed entry for first item
    // const firstEntry = paginatedHistory[0]
    // const detailedFirstEntry = await resolveDetailedHistoryEvent(firstEntry, userId)

    // // Get brief entries for remaining items
    // const remainingEntries = paginatedHistory.slice(1)
    // const briefPromises = remainingEntries.map(event => resolveBriefHistoryEvent(event, userId))
    // const resolvedBrief = await Promise.all(briefPromises)
    const resolved = await Promise.all(paginatedHistory.map(event => resolveDetailedHistoryEvent(event, userId)))

    const entries: ReadingHistoryEntry[] = [
        // detailedFirstEntry,
        // ...resolvedBrief
        ...resolved,
    ].filter(entry => entry !== undefined)

    return {
        entries,
        total,
        hasMore,
    }
}

export async function getReadingHistoryForHistoryList({
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

    const promises = paginatedHistory.map(event => resolveBriefHistoryEvent(event, userId))
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

    const success = await removeBooqHistory(userId, booqId as string)
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

async function resolveBriefHistoryEvent(event: DbReadingHistoryEvent, userId: string): Promise<BriefReadingHistoryEntry | undefined> {
    const { booqId, path, date } = event
    const [meta] = await booqDataForIds([booqId as BooqId])
    if (!meta) {
        console.warn(`Booq metadata not found for ID: ${booqId} while fetching history for: ${userId}`)
        return undefined
    }
    return {
        booqId: booqId as BooqId,
        path,
        lastRead: date,
        title: meta.title,
        authors: meta.authors,
        cover: meta.cover ? getUrlAndDimensions(booqId as BooqId, meta.cover, 210) : undefined,
    }
}

async function resolveDetailedHistoryEvent(event: DbReadingHistoryEvent, userId: string): Promise<DetailedReadingHistoryEntry | undefined> {
    const { booqId, path, date } = event
    const preview = await booqPreview(booqId as BooqId, path)
    if (!preview) {
        console.warn(`Booq preview not found for ID: ${booqId} while fetching history for: ${userId}`)
        return undefined
    }
    return {
        booqId: booqId as BooqId,
        path,
        lastRead: date,
        text: preview.text,
        position: preview.position,
        booqLength: preview.booqLength,
        title: preview.title ?? '',
        authors: preview.authors ?? [],
        cover: preview.cover ? getUrlAndDimensions(booqId as BooqId, preview.cover, 210) : undefined,
    }
}