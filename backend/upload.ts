import { addUpload } from './collections'
import { booqImageUrl } from './images'
import { uploadToLibrary } from './library'

export async function uploadEpubBook(fileBuffer: Buffer, userId: string) {
    const { id, title, coverSrc } = await uploadToLibrary('uu', fileBuffer, userId) ?? {}
    if (id) {
        const added = addUpload(userId, id)
        if (!added) {
            console.error('Failed to add upload to collection')
        }
        const coverUrl = coverSrc && booqImageUrl(id, coverSrc)
        return {
            success: true,
            id, title, coverUrl,
        } as const
    } else {
        return {
            success: false,
            error: 'Failed to upload book',
        }
    }
}