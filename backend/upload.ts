import { addUpload } from './collections'
import { booqImageUrl } from './images'
import { uploadToLibrary } from './library'

export async function uploadEpubBook(fileBuffer: Buffer, userId: string) {
    let { id, title, coverUrl } = await uploadToLibrary('uu', fileBuffer, userId) ?? { title: undefined, coverUrl: undefined }
    if (id) {
        const added = addUpload(userId, id)
        if (!added) {
            console.error('Failed to add upload to collection')
        }
        if (coverUrl) {
            coverUrl = booqImageUrl(id, coverUrl)
        }
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