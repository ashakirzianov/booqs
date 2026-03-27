import { BooqId } from '@/core'
import { booqSingleImage } from './library'
import { generateVariant, ImageVariant } from './images'
import { downloadAsset, IMAGES_BUCKET, uploadAsset } from './blob'

export async function getImageVariant(booqId: BooqId, filePathWithVariant: string): Promise<{
    buffer: Buffer,
    contentType: string,
} | undefined> {
    const parsed = parseImagePath(filePathWithVariant)
    if (!parsed) {
        return undefined
    }
    const { originalPath, variantPath, variant } = parsed

    const original = await getOrExtractOriginal(booqId, originalPath)
    if (!original) {
        return undefined
    }

    const variantBuffer = await getOrGenerateVariant(booqId, variantPath, original, variant)
    if (!variantBuffer) {
        return undefined
    }

    return {
        buffer: variantBuffer,
        contentType: contentTypeForFormat(variant.format),
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

async function getOrExtractOriginal(booqId: BooqId, filePath: string): Promise<Buffer | undefined> {
    const existing = await downloadOriginalImage(booqId, filePath)
    if (existing) {
        return existing
    }

    const image = await booqSingleImage(booqId, filePath)
    if (!image) {
        return undefined
    }

    await uploadOriginalImage(booqId, filePath, image)
    return image
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

    const generated = await generateVariant(original, variant)
    if (!generated) {
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
