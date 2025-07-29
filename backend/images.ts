import sharp from 'sharp'
import { uploadAsset } from './blob'
import { BooqId } from '@/core'
import { redis } from './db'

export const imageBucket = 'booqs-images'
export const coverSizes = [60, 120, 210] as const
export type CoverSize = typeof coverSizes[number]

export type ImageData = {
    width: number,
    height: number,
    url: string,
    sizes?: Partial<Record<CoverSize, ImageData>>,
}
export type ImagesData = Record<string, ImageData | undefined>
export async function getImagesDataForBooq({ booqId }: {
    booqId: BooqId,
}): Promise<ImagesData | undefined> {
    const data = await redis.hgetall<ImagesData>(`images:booq:${booqId}`)
    return data ?? undefined
}

export type Images = Record<string, Buffer>
export async function uploadImagesForBooq({
    booqId, coverSrc, images,
}: {
    booqId: BooqId,
    coverSrc?: string,
    images: Images,
}) {
    const data: ImagesData = {}
    for (const [src, buffer] of Object.entries(images)) {
        const uploadResult = await uploadImage(buffer, booqId, src)
        if (!uploadResult.success) {
            console.error(`Failed to upload image for ${booqId} with src ${src}`)
            continue

        }
        const imageData: ImageData = {
            width: uploadResult.width,
            height: uploadResult.height,
            url: uploadResult.url,
        }
        if (src === coverSrc) {
            for (const size of coverSizes) {
                const resized = await uploadImage(buffer, booqId, src, size)
                if (resized.success) {
                    imageData.sizes = imageData.sizes || {}
                    imageData.sizes[size] = {
                        width: resized.width,
                        height: resized.height,
                        url: resized.url,
                    }
                }
            }
        }
        data[src] = imageData
    }
    await redis.hmset(`images:booq:${booqId}`, data)
    return data
}

async function uploadImage(buffer: Buffer, booqId: BooqId, src: string, size?: number) {
    let id
    let width
    let height
    let bufferToUpload
    if (size) {
        id = `${booqId}/${src}@${size}`
        const resizeResult = await resizeImage(buffer, size)
        width = resizeResult.width
        height = resizeResult.height
        bufferToUpload = resizeResult.buffer
    } else {
        id = `${booqId}/${src}`
        const dimensions = await imageDimensions(buffer)
        width = dimensions.width
        height = dimensions.height
        bufferToUpload = buffer
    }

    const uploadResult = await uploadAsset(imageBucket, id, bufferToUpload)
    if (!uploadResult.$metadata) {
        return {
            success: false as const,
        }
    } else {
        return {
            success: true as const,
            url: `https://${imageBucket}.s3.amazonaws.com/${id}`,
            width,
            height,
        }
    }
}

async function resizeImage(buffer: Buffer, height: number) {
    const resized = sharp(buffer)
        .resize({
            height,
            fit: 'cover',
        })
    const [resizedBuffer, meta] = await Promise.all([
        resized.toBuffer(),
        resized.metadata(),
    ])
    return {
        buffer: resizedBuffer,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
    }
}

async function imageDimensions(buffer: Buffer): Promise<{ width: number, height: number }> {
    const metadata = await sharp(buffer).metadata()
    return {
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
    }
}
