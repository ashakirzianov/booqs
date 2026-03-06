'use server'

import { uploadEpubForUser } from '@/backend/uu'
import { BooqId } from '@/core'
import { addUpload } from '@/backend/collections'
import { getCurrentUser } from './user'
import { booqDataForIds } from '@/backend/library'
import { urlForBooqImageId } from '@/backend/urls'

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
        const booqId: BooqId = `uu-${result.id}`
        addUpload(auth.id, booqId)
        const [data] = await booqDataForIds([booqId])
        if (data) {
            return {
                success: true,
                booqId,
                title: data.title ?? undefined,
                coverUrl: data.coverSrc
                    ? urlForBooqImageId(data.booqId, data.coverSrc, 300)
                    : undefined,
            } as const
        }
    }
    return {
        success: false,
    } as const
}