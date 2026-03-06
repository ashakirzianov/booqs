import { BooqId } from '@/core'

export const IMAGES_BUCKET = 'booqs-images'

export const coverSizes = [60, 120, 210] as const
export type CoverSize = typeof coverSizes[number]
export function urlForBooqImageId(booqId: BooqId, imageId: string, width?: number): string {
    const assetId = `${booqId}/${imageId}`
    const url = `${process.env.NEXT_PUBLIC_IMAGE_ROOT}/${assetId}@${width ? `w${width}` : ''}.webp`
    return url
}