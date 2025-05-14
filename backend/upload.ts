import { addUpload } from './collections'
import { booqImageUrl } from './images'
import { uploadToLibrary } from './library'

export async function uploadEpubBook(fileBuffer: Buffer, userId: string) {
    const { booqId, title, coverSrc } = await uploadToLibrary('uu', fileBuffer, userId) ?? {}
    if (booqId) {
        const added = addUpload(userId, booqId)
        if (!added) {
            console.error('Failed to add upload to collection')
        }
        const coverUrl = coverSrc && booqImageUrl(booqId, coverSrc)
        return {
            success: true,
            booqId, title, coverUrl,
        } as const
    } else {
        return {
            success: false,
            error: 'Failed to upload book',
        }
    }
}