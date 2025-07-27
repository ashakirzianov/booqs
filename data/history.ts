'use server'
import { addBooqHistory, booqHistoryForUser, removeBooqHistory } from '@/backend/history'
import { booqPreview, booqMetadata } from '@/backend/booq'
import { BooqId, BooqPath } from '@/core'
import { getUserIdInsideRequest } from './request'

// Brief entry for history page - just book info and read time
export type BriefReadingHistoryEntry = {
    booqId: BooqId,
    path: BooqPath,
    lastRead: number,
    title: string,
    authors: string[],
    coverSrc?: string,
}

// Detailed entry for main page - includes reading position and preview
export type DetailedReadingHistoryEntry = BriefReadingHistoryEntry & {
    text: string,
    position: number,
    booqLength: number,
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

export type DetailedReadingHistoryResult = {
    entries: DetailedReadingHistoryEntry[]
    total: number
    hasMore: boolean
}

export type BriefReadingHistoryResult = {
    entries: BriefReadingHistoryEntry[]
    total: number
    hasMore: boolean
}

export async function getReadingHistoryWithDetailedEntries({
    limit = 20,
    offset = 0,
}: {
    limit?: number
    offset?: number
} = {}): Promise<DetailedReadingHistoryResult | undefined> {
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
        const historyEntry: DetailedReadingHistoryEntry = {
            booqId: booqId as BooqId,
            path,
            lastRead: date,
            text: preview.text,
            position: preview.position,
            booqLength: preview.booqLength,
            title: preview.title ?? '',
            authors: preview.authors ?? [],
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

export async function getReadingHistoryWithBriefEntries({
    limit = 20,
    offset = 0,
}: {
    limit?: number
    offset?: number
} = {}): Promise<BriefReadingHistoryResult | undefined> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const history = await booqHistoryForUser(userId)
    const total = history.length
    const paginatedHistory = history.slice(offset, offset + limit)
    const hasMore = offset + limit < total

    const promises = paginatedHistory.map(async ({ booqId, path, date }) => {
        const meta = await booqMetadata(booqId as BooqId)
        if (!meta) {
            console.warn(`Booq metadata not found for ID: ${booqId} while fetching history for: ${userId}`)
            return undefined
        }
        const historyEntry: BriefReadingHistoryEntry = {
            booqId: booqId as BooqId,
            path,
            lastRead: date,
            title: meta.title,
            authors: meta.authors.map(author => author.name),
            coverSrc: meta.coverSrc,
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