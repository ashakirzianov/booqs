import { redis } from './db'

const DEFAULT_TTL = 60 * 60 * 24 // 1 day in seconds

export async function getCachedValueForKey<T>(key: string): Promise<T | undefined> {
    const result = await redis.get<T>(`cache:${key}`)
    return result ?? undefined
}

export async function cacheValueForKey<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expirationTime = ttl ?? DEFAULT_TTL
    await redis.set(`cache:${key}`, value, { ex: expirationTime })
}

export function createCachingStream(originalStream: ReadableStream<Uint8Array>, cacheKey: string, ttl?: number): ReadableStream<Uint8Array> {
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
                            // Cache the complete response
                            if (accumulatedData) {
                                await cacheValueForKey(cacheKey, accumulatedData, ttl)
                            }
                            controller.close()
                            break
                        }

                        // Accumulate data for caching
                        const chunk = decoder.decode(value, { stream: true })
                        accumulatedData += chunk

                        // Forward the chunk to the consumer
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