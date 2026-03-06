import { BooqId } from '@/core'
import { getImageVariant } from '@/backend/images'

export async function fetchImageVariant(booqId: BooqId, filePathWithVariant: string) {
    return getImageVariant(booqId, filePathWithVariant)
}