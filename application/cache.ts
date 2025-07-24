export type CacheEvent<T> = { event: 'chunk', chunk: T }
    | { event: 'error', error: string }
    | { event: 'complete' }
export type CacheProducer<T> = (key: string) => AsyncGenerator<T>
export type CacheListener<T> = (event: CacheEvent<T>) => void

export function createStreamingCache<T>(producer: CacheProducer<T>) {
    type CacheValue = {
        stored: T[],
        listeners: Set<CacheListener<T>>,
    }
    const cache = new Map<string, CacheValue>()
    async function subscribe(key: string, listener: CacheListener<T>) {
        const existing = cache.get(key)
        if (existing) {
            for (const chunk of existing.stored) {
                listener({ event: 'chunk', chunk })
            }
            existing.listeners.add(listener)
            return
        }
        const newValue: CacheValue = {
            stored: [],
            listeners: new Set([listener]),
        }
        cache.set(key, newValue)
        function broadcast(event: CacheEvent<T>) {
            if (event.event === 'chunk') {
                newValue.stored.push(event.chunk)
            }
            for (const listener of newValue.listeners) {
                listener(event)
            }
        }
        try {
            for await (const chunk of producer(key)) {
                broadcast({ event: 'chunk', chunk })
            }
        } catch (error) {
            broadcast({
                event: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        } finally {
            broadcast({ event: 'complete' })
        }
    }
    async function unsubscribe(key: string, listener: CacheListener<T>) {
        const existing = cache.get(key)
        if (existing) {
            existing.listeners.delete(listener)
        }
    }
    return {
        subscribe,
        unsubscribe,
    }
}