import { BooqPath } from '@/core'
import { redis } from './db'

export type DbReadingHistoryEvent = {
    booqId: string,
    source: string,
    path: BooqPath,
    date: number,
}
type DbReadingHistory = DbReadingHistoryEvent[]
type RedisHashValue = Omit<DbReadingHistoryEvent, 'booqId' | 'source'>
export async function booqHistoryForUser(userId: string): Promise<DbReadingHistory> {
    const record = await redis.hgetall<Record<string, RedisHashValue>>(`user:${userId}:history`) ?? {}
    const history: DbReadingHistory = Object.entries(record).map(([key, value]) => {
        const [booqId, source] = key.split(':')
        return {
            booqId,
            source,
            ...value,
        }
    })
    history.sort((a, b) => b.date - a.date)
    return history
}

export async function addBooqHistory(
    userId: string,
    { booqId, source, ...data }: DbReadingHistoryEvent,
) {
    const result = await redis.hset(`user:${userId}:history`, {
        [`${booqId}:${source}`]: JSON.stringify(data),
    })
    return result > 0 ? {
        booqId,
        source,
        ...data,
    } : null
}

export async function removeBooqHistory(
    userId: string,
    booqId: string,
) {
    // Get all history entries for the user
    const record = await redis.hgetall<Record<string, RedisHashValue>>(`user:${userId}:history`) ?? {}
    
    // Find all keys that start with the booqId
    const keysToDelete = Object.keys(record).filter(key => key.startsWith(`${booqId}:`))
    
    if (keysToDelete.length === 0) {
        return false
    }
    
    // Delete all matching entries
    const result = await redis.hdel(`user:${userId}:history`, ...keysToDelete)
    return result > 0
}