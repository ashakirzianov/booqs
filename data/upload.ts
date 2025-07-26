'use server'

import { uploadEpubForUser } from '@/backend/uu'
import { BooqId } from '@/core'
import { addUpload } from '@/backend/collections'
import { getCurrentUser } from './user'

export async function uploadEpubAction(file: File) {
    const auth = await getCurrentUser()
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
            title: result.meta.title ?? undefined,
            coverSrc: result.meta.coverSrc,
        } as const
    } else {
        return {
            success: false,
        } as const
    }
}