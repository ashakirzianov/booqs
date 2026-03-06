import { BooqId } from '@/core'

export const IMAGES_BUCKET = 'booqs-images'

export const variantSizes = [60, 120, 240, 360] as const
export type VariantSize = typeof variantSizes[number]
export function urlForBooqImageVariant({ booqId, imageId, width }: {
    booqId: BooqId, imageId: string, width?: VariantSize
}): string {
    const assetId = `${booqId}/${imageId}`
    const url = `${process.env.NEXT_PUBLIC_IMAGE_ROOT}/${assetId}@${width ? `w${width}` : ''}.webp`
    return url
}