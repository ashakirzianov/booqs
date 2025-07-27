import { BooqPath } from '@/core'
import { redis } from './db'

export type DbReadingHistoryEvent = {
    booqId: string,
    path: BooqPath,
    date: number,
}
type DbReadingHistory = DbReadingHistoryEvent[]
type RedisHashValue = Omit<DbReadingHistoryEvent, 'booqId'>
export async function booqHistoryForUser(userId: string): Promise<DbReadingHistory> {
    const record = await redis.hgetall<Record<string, RedisHashValue>>(`user:${userId}:history`) ?? {}
    const history: DbReadingHistory = Object.entries(record).map(([booqId, value]) => {
        return {
            booqId,
            ...value,
        }
    })
    history.sort((a, b) => b.date - a.date)
    return history
}

export async function addBooqHistory(
    userId: string,
    { booqId, ...data }: DbReadingHistoryEvent,
) {
    const result = await redis.hset(`user:${userId}:history`, {
        [booqId]: JSON.stringify(data),
    })
    return result > 0 ? {
        booqId,
        ...data,
    } : null
}

export async function removeBooqHistory(
    userId: string,
    booqId: string,
) {
    const result = await redis.hdel(`user:${userId}:history`, booqId)
    return result > 0
}