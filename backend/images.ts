import sharp from 'sharp'
import { uploadAsset } from './blob'
import { BooqId, parseId } from '@/core'
import { redis } from './db'

export const imageBucket = 'booqs-images'
export const coverSizes = [60, 120, 210] as const
export type CoverSize = typeof coverSizes[number]

export type BooqImageData = {
    width: number,
    height: number,
    id: string,
    sizes?: Partial<Record<CoverSize, BooqImageData>>,
}
export type BooqImagesData = Record<string, BooqImageData>
export type BooqImages = Record<string, Buffer>

export function urlForBooqImageId(booqId: BooqId, imageId: string) {
    const [libraryId, id] = parseId(booqId)
    const assetId = `${libraryId}/${id}/${imageId}`
    return `https://${imageBucket}.s3.amazonaws.com/${assetId}`
}

export async function resolveBooqImage({
    booqId, src,
}: {
    booqId: BooqId,
    src: string,
}): Promise<BooqImageData | undefined> {
    const imageData = await redis.hget<BooqImageData>(`images:booq:${booqId}`, src)
    return imageData ?? undefined
}

export async function getOrLoadImagesData({
    booqId,
    loadImages,
}: {
    booqId: BooqId,
    loadImages: () => Promise<BooqImages | undefined>,
}): Promise<{
    data: BooqImagesData,
    fromCache: boolean,
}> {
    type RedisBooqImagesData = BooqImagesData & {
        '!empty'?: true,
    }
    const cached = await redis.hgetall<RedisBooqImagesData>(`images:booq:${booqId}`)
    if (cached) {
        return cached['!empty']
            ? {
                data: {},
                fromCache: true,
            }
            : {
                data: cached,
                fromCache: true,
            }
    }
    const images = await loadImages()
    if (images) {
        const uploaded = await uploadImagesForBooq({ booqId, images })
        if (Object.keys(uploaded).length > 0) {
            await redis.hset<BooqImageData>(`images:booq:${booqId}`, uploaded)
            return {
                data: uploaded,
                fromCache: false,
            }
        }
    }
    await redis.hset(`images:booq:${booqId}`, {
        '!empty': true,
    })
    return {
        data: {},
        fromCache: false,
    }
}

async function uploadImagesForBooq({
    booqId, coverSrc, images,
}: {
    booqId: BooqId,
    coverSrc?: string,
    images: BooqImages,
}) {
    const data: BooqImagesData = {}
    for (const [src, buffer] of Object.entries(images)) {
        const uploadResult = await uploadImage(buffer, booqId, src)
        if (!uploadResult.success) {
            console.error(`Failed to upload image for ${booqId} with src ${src}`)
            continue

        }
        const imageData: BooqImageData = {
            width: uploadResult.width,
            height: uploadResult.height,
            id: uploadResult.id,
        }
        if (src === coverSrc) {
            for (const size of coverSizes) {
                const resized = await uploadImage(buffer, booqId, src, size)
                if (resized.success) {
                    imageData.sizes = imageData.sizes || {}
                    imageData.sizes[size] = {
                        width: resized.width,
                        height: resized.height,
                        id: resized.id,
                    }
                }
            }
        }
        data[src] = imageData
    }
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

    const [libraryId, inLibraryId] = parseId(booqId)
    const assetId = `${libraryId}/${inLibraryId}/${id}`
    const uploadResult = await uploadAsset(imageBucket, assetId, bufferToUpload)
    if (!uploadResult.$metadata) {
        return {
            success: false as const,
        }
    } else {
        return {
            success: true as const,
            id,
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
