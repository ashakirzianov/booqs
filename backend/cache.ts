import { LRUCache } from 'lru-cache'
import { Booq, BooqId } from '@/core'
import { redis } from './db'
import { downloadAsset, uploadAsset } from './blob'
import type { BooqFile } from './library'

// --- Redis key-value cache ---

const DEFAULT_TTL = 60 * 60 * 24 // 1 day in seconds

export async function getRedisCacheValue<T>(key: string): Promise<T | undefined> {
    const result = await redis.get<T>(`cache:${key}`)
    return result ?? undefined
}

export async function setRedisCacheValue<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expirationTime = ttl ?? DEFAULT_TTL
    await redis.set(`cache:${key}`, value, { ex: expirationTime })
}

export function createRedisCachingStream(originalStream: ReadableStream<Uint8Array>, cacheKey: string, ttl?: number): ReadableStream<Uint8Array> {
    let accumulatedData = ''
    const decoder = new TextDecoder()

    return new ReadableStream({
        start(controller) {
            const reader = originalStream.getReader()

            async function pump(): Promise<void> {
                try {
                    while (true) {
                        const { done, value } = await reader.read()

                        if (done) {
                            if (accumulatedData) {
                                await setRedisCacheValue(cacheKey, accumulatedData, ttl)
                            }
                            controller.close()
                            break
                        }

                        const chunk = decoder.decode(value, { stream: true })
                        accumulatedData += chunk
                        controller.enqueue(value)
                    }
                } catch (error) {
                    console.error('Stream pump error:', error)
                    controller.error(error)
                } finally {
                    reader.releaseLock()
                }
            }

            pump()
        }
    })
}

// --- S3 booq cache ---

const BOOQ_CACHE_BUCKET = 'booqs-cache'
const BOOQ_CACHE_PATH = 'booqs'

export async function getCachedBooq(booqId: BooqId): Promise<Booq | undefined> {
    const buffer = await downloadAsset(BOOQ_CACHE_BUCKET, `${BOOQ_CACHE_PATH}/${booqId}.json`)
    if (!buffer) {
        return undefined
    }
    try {
        return JSON.parse(buffer.toString('utf-8'))
    } catch {
        return undefined
    }
}

export async function setCachedBooq(booqId: BooqId, booq: Booq): Promise<void> {
    const json = JSON.stringify(booq)
    await uploadAsset(BOOQ_CACHE_BUCKET, `${BOOQ_CACHE_PATH}/${booqId}.json`, Buffer.from(json, 'utf-8'))
}

// --- In-memory file cache ---

const fileCache = new LRUCache<BooqId, BooqFile>({ max: 10 })

export function getCachedBooqFile(booqId: BooqId): BooqFile | undefined {
    return fileCache.get(booqId)
}

export function setCachedBooqFile(booqId: BooqId, file: BooqFile): void {
    fileCache.set(booqId, file)
}
