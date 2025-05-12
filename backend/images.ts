import sharp from 'sharp'
import { uploadAsset } from './blob'
import { Booq, BooqId } from '@/core'

const bucket = 'booqs-images'
const coverSizes = [60, 120, 210] as const
export type CoverSize = typeof coverSizes[number]

export function booqImageUrl(booqId: BooqId, src: string, size?: CoverSize) {
    const base = `https://${bucket}.s3.amazonaws.com/${booqId}/${src}`
    return size ? `${base}@${size}` : base
}

export async function uploadBooqImages(booqId: BooqId, booq: Booq) {
    const allImages = Object.entries(booq.images).map(
        ([src, base64]) => uploadImage(base64, booqId, src),
    )
    if (typeof booq.meta.coverSrc === 'string') {
        const coverSrc = booq.meta.coverSrc
        const coverBuffer = booq.images[coverSrc]
        if (coverBuffer) {
            const covers = coverSizes.map(
                size => uploadImage(coverBuffer, booqId, coverSrc, size),
            )
            return Promise.all([...covers, ...allImages])
        }
    }
    return Promise.all(allImages)
}

async function uploadImage(base64: string, booqId: BooqId, src: string, size?: number) {
    const id = size
        ? `${booqId}/${src}@${size}`
        : `${booqId}/${src}`
    const buffer = Buffer.from(base64, 'base64')
    const toUpload = size
        ? await resizeImage(buffer, size)
        : buffer
    const result = await uploadAsset(bucket, id, toUpload)
    return result.$metadata
        ? { success: true, id }
        : { success: false, id }
}

async function resizeImage(buffer: Buffer, height: number): Promise<Buffer> {
    return sharp(buffer)
        .resize({
            height,
            fit: 'cover',
        })
        .toBuffer()
}
