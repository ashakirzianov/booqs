import { BooqId } from '@/core'

export const coverSizes = [60, 120, 210] as const
export type CoverSize = typeof coverSizes[number]
export function urlForBooqImageId(booqId: BooqId, imageId: string, width?: number): string {
    const assetId = `${booqId}/${imageId}`
    const url = `${process.env.NEXT_PUBLIC_URL}/api/images/@${assetId}${width ? `w${width}` : ''}.webp`
    return url
}