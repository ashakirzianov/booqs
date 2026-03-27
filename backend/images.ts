import sharp from 'sharp'

export type ImageDimensions = {
    width: number,
    height: number,
}
export type BooqImageDimensions = Record<string, ImageDimensions>
export type BooqImages = {
    images: Record<string, Buffer>,
    coverSrc?: string,
}

const IMAGE_TIMEOUT_MS = 5000

export async function imageDimensions(buffer: Buffer): Promise<{ width: number, height: number }> {
    const metadata = await Promise.race([
        sharp(buffer).metadata(),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Image processing timed out')), IMAGE_TIMEOUT_MS)
        ),
    ])
    return {
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
    }
}

export type ImageVariant = {
    width?: number,
    quality?: number,
    format: string,
}

export async function generateVariant(buffer: Buffer, variant: ImageVariant): Promise<Buffer | undefined> {
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