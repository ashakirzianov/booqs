import sharp from 'sharp'
import { uploadAsset } from './blob'
import { Booq, BooqId } from '@/core'
import { coverSizes, imageBucket } from '@/common'

export async function uploadBooqImages(booqId: BooqId, booq: Booq) {
    const allImages = Object.entries(booq.images).map(
        ([src, base64]) => uploadImage(base64, booqId, src),
    )
    if (typeof booq.metadata.coverSrc === 'string') {
        const coverSrc = booq.metadata.coverSrc
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
    const result = await uploadAsset(imageBucket, id, toUpload)
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
