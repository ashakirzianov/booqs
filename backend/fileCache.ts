import { LRUCache } from 'lru-cache'
import { BooqId } from '@/core'
import type { BooqFile } from './library'

const fileCache = new LRUCache<BooqId, BooqFile>({ max: 10 })

export function getCachedBooqFile(booqId: BooqId): BooqFile | undefined {
    return fileCache.get(booqId)
}

export function setCachedBooqFile(booqId: BooqId, file: BooqFile): void {
    fileCache.set(booqId, file)
}
