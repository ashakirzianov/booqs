import { BooqId } from '@/core'
import { extractAndUploadMissingOriginals, getImageVariant } from '@/backend/variants'

export async function fetchImageVariant(booqId: BooqId, filePathWithVariant: string) {
    return getImageVariant(booqId, filePathWithVariant)
}

export async function uploadMissingOriginals(booqId: BooqId) {
    return extractAndUploadMissingOriginals(booqId)
}