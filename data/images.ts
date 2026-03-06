import sharp from 'sharp'
import { BooqId } from '@/core'
import { downloadAsset, uploadAsset } from '@/backend/blob'
import { imageBucket } from '@/backend/images'
import { epubFileForBooqId } from '@/backend/library'
import { parseAndLoadImagesFromFile } from '@/backend/parse'

export type ImageVariant = {
    width?: number,
    quality?: number,
    format: string,
}

type ParsedImagePath = {
    originalPath: string,
    variantPath: string,
    variant: ImageVariant,
}

export function parseImagePath(filePathWithVariant: string): ParsedImagePath | undefined {
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

export async function fetchImageVariant(booqId: BooqId, filePathWithVariant: string): Promise<{
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

async function getOrExtractOriginal(booqId: BooqId, filePath: string): Promise<Buffer | undefined> {
    const s3Key = `originals/${booqId}/${filePath}`
    const existing = await downloadAsset(imageBucket, s3Key)
    if (existing) {
        return existing
    }

    const images = await extractAllImagesFromEpub(booqId)
    if (!images) {
        return undefined
    }

    await Promise.all(
        Object.entries(images).map(([src, buffer]) =>
            uploadAsset(imageBucket, `originals/${booqId}/${src}`, buffer)
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
    const s3Key = `variants/${booqId}/${variantPath}`
    const existing = await downloadAsset(imageBucket, s3Key)
    if (existing) {
        return existing
    }

    const generated = await generateVariant(original, variant)
    if (!generated) {
        return undefined
    }

    await uploadAsset(imageBucket, s3Key, generated)
    return generated
}

async function extractAllImagesFromEpub(booqId: BooqId): Promise<Record<string, Buffer> | undefined> {
    const file = await epubFileForBooqId(booqId)
    if (!file) {
        return undefined
    }
    const booqImages = await parseAndLoadImagesFromFile(file)
    if (!booqImages) {
        return undefined
    }
    return booqImages.images
}

async function generateVariant(buffer: Buffer, variant: ImageVariant): Promise<Buffer | undefined> {
    try {
        const { width, quality, format } = variant
        let pipeline = sharp(buffer)
        if (width) {
            pipeline = pipeline.resize({ width })
        }
        switch (format) {
            case 'webp':
                pipeline = pipeline.webp({ quality })
                break
            case 'avif':
                pipeline = pipeline.avif({ quality })
                break
            case 'png':
                pipeline = pipeline.png({ quality })
                break
            case 'jpg':
            case 'jpeg':
                pipeline = pipeline.jpeg({ quality })
                break
            default:
                pipeline = pipeline.toFormat(format as any, { quality })
        }
        return await pipeline.toBuffer()
    } catch {
        return undefined
    }
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
