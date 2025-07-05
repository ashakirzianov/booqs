'use server'

import { uploadEpubForUser } from '@/backend/uu'
import { fetchAuthData } from './auth'
import { booqImageUrl } from '@/backend/images'
import { BooqId } from '@/core'
import { addUpload } from '@/backend/collections'

export async function uploadEpubAction(file: File) {
    const auth = await fetchAuthData()
    if (!auth) {
        return {
            success: false,
            error: 'Not authenticated',
        } as const
    }
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const result = await uploadEpubForUser(buffer, auth.id)
    if (result) {
        const booqId: BooqId = `uu/${result.id}`
        addUpload(auth.id, booqId)
        return {
            success: true,
            booqId,
            title: result.title ?? undefined,
            coverUrl: result.coverSrc ? booqImageUrl(booqId, result.coverSrc) : undefined,
        } as const
    } else {
        return {
            success: false,
        } as const
    }
}