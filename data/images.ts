import { booqImageUrl, CoverSize } from '@/backend/images'
import { BooqId } from '@/core'

export function resolveImageSrc(booqId: BooqId, coverSrc: string, size?: CoverSize): string {
    return booqImageUrl(booqId, coverSrc, size)
}