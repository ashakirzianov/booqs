import { BooqPath } from '@/core'
import { redis } from './db'

export type DbReadingHistoryEvent = {
    booqId: string,
    source: string,
    path: BooqPath,
    date: number,
}
type DbReadingHistory = Array<{
    booqId: string,
    source: string,
    path: BooqPath,
    date: number,
}>
type RedisHashValue = Omit<DbReadingHistoryEvent, 'booqId' | 'source'>
export async function booqHistoryForUser(userId: string): Promise<DbReadingHistory> {
    const record = await redis.hgetall<Record<string, string>>(`user:${userId}:history`) ?? {}
    const history: DbReadingHistory = Object.entries(record).map(([key, value]) => {
        const [booqId, source] = key.split(':')
        const data = JSON.parse(value) as RedisHashValue
        return {
            booqId,
            source,
            ...data,
        }
    })
    history.sort((a, b) => b.date - a.date)
    return history
}

export async function addBooqHistory(
    userId: string,
    { booqId, source, ...data }: DbReadingHistoryEvent,
) {
    return redis.hset(`user:${userId}:history`, {
        [`${booqId}:${source}`]: JSON.stringify(data),
    })
}