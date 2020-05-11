import { Booq, coverSize, previewCoverSize } from "../core";
import { uploadAsset } from "./s3";
import sharp from 'sharp';

export async function uploadImages(booqId: string, booq: Booq) {
    const promises = Object.entries(booq.images).map(
        ([src, base64]) => uploadImage(base64, booqId, src),
    );

    if (typeof booq.meta.cover === 'string') {
        const coverSrc = booq.meta.cover;
        const coverBuffer = booq.images[coverSrc];
        if (coverBuffer) {
            const coverPromise = uploadImage(coverBuffer, booqId, coverSrc, coverSize);
            const coverPreviewPromise = uploadImage(coverBuffer, booqId, coverSrc, previewCoverSize);
            return Promise.all([coverPromise, coverPreviewPromise, ...promises]);
        }
    }
    return Promise.all(promises);
}

const imagesBucket = 'booqs-images';
async function uploadImage(base64: string, booqId: string, src: string, size?: number) {
    const id = size
        ? `${booqId}/${src}@${size * 3}`
        : `${booqId}/${src}`;
    const buffer = Buffer.from(base64, 'base64');
    const toUpload = size
        ? await resizeImage(buffer, size * 3)
        : buffer;
    const result = await uploadAsset(imagesBucket, id, toUpload);
    return result.$response
        ? id
        : undefined;
}

async function resizeImage(buffer: Buffer, height: number): Promise<Buffer> {
    return sharp(buffer)
        .resize({
            height,
            fit: 'cover',
        })
        .toBuffer();
}
