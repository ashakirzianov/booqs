import { BooqId } from '@/core'
import { booqFileForId } from './library'
import { parseAndLoadImagesFromFile } from './parse'
import { generateVariant, ImageVariant } from './image-processor'
import { downloadAsset, uploadAsset } from './blob'

const imageBucket = 'booqs-images'

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

async function extractAllImagesFromEpub(booqId: BooqId): Promise<Record<string, Buffer> | undefined> {
    const file = await booqFileForId(booqId)
    if (!file) {
        return undefined
    }
    const booqImages = await parseAndLoadImagesFromFile(file)
    if (!booqImages) {
        return undefined
    }
    return booqImages.images
}

async function getOrExtractOriginal(booqId: BooqId, filePath: string): Promise<Buffer | undefined> {
    const existing = await downloadOriginalImage(booqId, filePath)
    if (existing) {
        return existing
    }

    const images = await extractAllImagesFromEpub(booqId)
    if (!images) {
        return undefined
    }

    await Promise.all(
        Object.entries(images).map(([src, buffer]) =>
            uploadOriginalImage(booqId, src, buffer)
        )
    )

    return images[filePath]
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
    return uploadAsset(imageBucket, `originals/${booqId}/${imageId}`, buffer)
}

async function uploadVariantImage(booqId: BooqId, variantPath: string, buffer: Buffer) {
    return uploadAsset(imageBucket, `variants/${booqId}/${variantPath}`, buffer)
}

async function downloadOriginalImage(booqId: BooqId, imageId: string): Promise<Buffer | undefined> {
    const s3Key = `originals/${booqId}/${imageId}`
    return downloadAsset(imageBucket, s3Key)
}

async function downloadVariantImage(booqId: BooqId, variantPath: string): Promise<Buffer | undefined> {
    const s3Key = `variants/${booqId}/${variantPath}`
    return downloadAsset(imageBucket, s3Key)
}
