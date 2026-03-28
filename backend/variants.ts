import { BooqId } from '@/core'
import { booqImageLoader, booqSingleImage } from './library'
import { generateVariant, ImageVariant } from './images'
import { assetExists, downloadAsset, IMAGES_BUCKET, listAssetKeys, uploadAsset } from './blob'

export type ImageVariantResult = {
    buffer: Buffer,
    contentType: string,
    extracted: boolean,
}

export async function getImageVariant(booqId: BooqId, filePathWithVariant: string): Promise<ImageVariantResult | undefined> {
    const parsed = parseImagePath(filePathWithVariant)
    if (!parsed) {
        return undefined
    }
    const { originalPath, variantPath, variant } = parsed

    const originalResult = await getOrExtractOriginal(booqId, originalPath)
    if (!originalResult) {
        return undefined
    }
    const { image: original, extracted } = originalResult

    const variantBuffer = await getOrGenerateVariant(booqId, variantPath, original, variant)
    if (!variantBuffer) {
        return undefined
    }

    return {
        buffer: variantBuffer,
        contentType: contentTypeForFormat(variant.format),
        extracted,
    }
}

type ParsedImagePath = {
    originalPath: string,
    variantPath: string,
    variant: ImageVariant,
}

function parseImagePath(filePathWithVariant: string): ParsedImagePath | undefined {
    const atIdx = filePathWithVariant.lastIndexOf('@')
    if (atIdx < 0) {
        return undefined
    }
    const originalPath = filePathWithVariant.slice(0, atIdx)
    const variantSpec = filePathWithVariant.slice(atIdx + 1)
    const match = variantSpec.match(/^(w(\d+))?(q(\d+))?\.(\w+)$/)
    if (!match) {
        return undefined
    }
    const width = match[2] ? parseInt(match[2], 10) : undefined
    const quality = match[4] ? parseInt(match[4], 10) : undefined
    const format = match[5]
    return {
        originalPath,
        variantPath: filePathWithVariant,
        variant: { width, quality, format },
    }
}

async function getOrExtractOriginal(booqId: BooqId, filePath: string): Promise<{ image: Buffer, extracted: boolean } | undefined> {
    const existing = await downloadOriginalImage(booqId, filePath)
    if (existing) {
        return { image: existing, extracted: false }
    }

    if (await isFailedOriginal(booqId, filePath)) {
        return undefined
    }

    const image = await booqSingleImage(booqId, filePath)
    if (!image) {
        await markFailedOriginal(booqId, filePath)
        return undefined
    }

    await uploadOriginalImage(booqId, filePath, image)
    return { image, extracted: true }
}

async function getOrGenerateVariant(
    booqId: BooqId,
    variantPath: string,
    original: Buffer,
    variant: ImageVariant,
): Promise<Buffer | undefined> {
    const existing = await downloadVariantImage(booqId, variantPath)
    if (existing) {
        return existing
    }

    if (await isFailedVariant(booqId, variantPath)) {
        return undefined
    }

    const generated = await generateVariant(original, variant)
    if (!generated) {
        await markFailedVariant(booqId, variantPath)
        return undefined
    }

    await uploadVariantImage(booqId, variantPath, generated)
    return generated
}

function contentTypeForFormat(format: string): string {
    switch (format) {
        case 'webp': return 'image/webp'
        case 'avif': return 'image/avif'
        case 'png': return 'image/png'
        case 'jpg':
        case 'jpeg': return 'image/jpeg'
        default: return 'application/octet-stream'
    }
}

async function uploadOriginalImage(booqId: BooqId, imageId: string, buffer: Buffer) {
    return uploadAsset(IMAGES_BUCKET, `originals/${booqId}/${imageId}`, buffer)
}

async function uploadVariantImage(booqId: BooqId, variantPath: string, buffer: Buffer) {
    return uploadAsset(IMAGES_BUCKET, `variants/${booqId}/${variantPath}`, buffer)
}

async function downloadOriginalImage(booqId: BooqId, imageId: string): Promise<Buffer | undefined> {
    const s3Key = `originals/${booqId}/${imageId}`
    return downloadAsset(IMAGES_BUCKET, s3Key)
}

async function downloadVariantImage(booqId: BooqId, variantPath: string): Promise<Buffer | undefined> {
    const s3Key = `variants/${booqId}/${variantPath}`
    return downloadAsset(IMAGES_BUCKET, s3Key)
}

const FAILED_SENTINEL = Buffer.alloc(0)

function failedOriginalKey(booqId: BooqId, imageId: string): string {
    return `failed-originals/${booqId}/${imageId}`
}

function failedVariantKey(booqId: BooqId, variantPath: string): string {
    return `failed-variants/${booqId}/${variantPath}`
}

async function isFailedOriginal(booqId: BooqId, imageId: string): Promise<boolean> {
    return assetExists(IMAGES_BUCKET, failedOriginalKey(booqId, imageId))
}

async function markFailedOriginal(booqId: BooqId, imageId: string): Promise<void> {
    await uploadAsset(IMAGES_BUCKET, failedOriginalKey(booqId, imageId), FAILED_SENTINEL)
}

async function isFailedVariant(booqId: BooqId, variantPath: string): Promise<boolean> {
    return assetExists(IMAGES_BUCKET, failedVariantKey(booqId, variantPath))
}

async function markFailedVariant(booqId: BooqId, variantPath: string): Promise<void> {
    await uploadAsset(IMAGES_BUCKET, failedVariantKey(booqId, variantPath), FAILED_SENTINEL)
}

const UPLOAD_BATCH_SIZE = 20

export async function extractAndUploadMissingOriginals(booqId: BooqId): Promise<void> {
    const loader = await booqImageLoader(booqId)
    if (!loader) {
        return
    }

    const prefix = `originals/${booqId}/`
    const existingKeys = await listAssetKeys(IMAGES_BUCKET, prefix)
    const existingSet = new Set(existingKeys.map(k => k.slice(prefix.length)))

    const missingSrcs = loader.srcs.filter(src => !existingSet.has(src))
    if (missingSrcs.length === 0) {
        return
    }

    for (let i = 0; i < missingSrcs.length; i += UPLOAD_BATCH_SIZE) {
        const batch = missingSrcs.slice(i, i + UPLOAD_BATCH_SIZE)
        await Promise.all(batch.map(async (src) => {
            const buffer = await loader.loadImage(src)
            if (buffer) {
                await uploadOriginalImage(booqId, src, buffer)
            }
        }))
    }
}
