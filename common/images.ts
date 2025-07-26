import { BooqId } from '@/core'

export const imageBucket = 'booqs-images'
export const coverSizes = [60, 120, 210] as const
export type CoverSize = typeof coverSizes[number]

export function resolveImageSrc(booqId: BooqId, src: string, size?: CoverSize): string {
    const base = `https://${imageBucket}.s3.amazonaws.com/${booqId}/${src}`
    return size ? `${base}@${size}` : base
}

export function coverSizeForSize(size: number): CoverSize | undefined {
    for (const coverSize of coverSizes) {
        if (size <= coverSize) {
            return coverSize
        }
    }
    return undefined
}