import sharp from 'sharp'
import { BooqId } from '@/core'


export const imageBucket = 'booqs-images'
export const coverSizes = [60, 120, 210] as const
export type CoverSize = typeof coverSizes[number]

export type ImageDimensions = {
    width: number,
    height: number,
}
export type BooqImageDimensions = Record<string, ImageDimensions>
export type BooqImages = {
    images: Record<string, Buffer>,
    coverSrc?: string,
}

export function urlForBooqImageId(booqId: BooqId, imageId: string, width?: number): string {
    const assetId = `${booqId}/${imageId}`
    const url = `${process.env.NEXT_PUBLIC_URL}/api/images/@${assetId}${width ? `w${width}` : ''}.webp`
    return url
}

export async function imageDimensions(buffer: Buffer): Promise<{ width: number, height: number }> {
    const metadata = await sharp(buffer).metadata()
    return {
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
    }
}