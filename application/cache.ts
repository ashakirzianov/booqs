export type CacheEvent<T> = { event: 'chunk', chunk: T }
    | { event: 'error', error: string }
    | { event: 'complete' }
export type CacheProducer<In, Out> = (input: In) => AsyncGenerator<Out>
export type CacheListener<T> = (event: CacheEvent<T>) => void

export function createStreamingCache<In, Out>(producer: CacheProducer<In, Out>) {
    type CacheValue = {
        stored: Out[],
        listeners: Set<CacheListener<Out>>,
    }
    const cache = new Map<string, CacheValue>()
    async function subscribe(input: In, listener: CacheListener<Out>) {
        const key = generateCacheKey(input)
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
        function broadcast(event: CacheEvent<Out>) {
            if (event.event === 'chunk') {
                newValue.stored.push(event.chunk)
            }
            for (const listener of newValue.listeners) {
                listener(event)
            }
        }
        try {
            for await (const chunk of producer(input)) {
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
    async function unsubscribe(input: In, listener: CacheListener<Out>) {
        const existing = cache.get(generateCacheKey(input))
        if (existing) {
            existing.listeners.delete(listener)
        }
    }
    return {
        subscribe,
        unsubscribe,
    }
}

function generateCacheKey<In>(input: In): string {
    return JSON.stringify(input)
}