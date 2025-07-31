'use server'

import { uploadEpubForUser } from '@/backend/uu'
import { BooqId } from '@/core'
import { addUpload } from '@/backend/collections'
import { getCurrentUser } from './user'
import { booqDataForIds } from '@/backend/library'
import { urlForBooqImageId } from '@/backend/images'

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
        const booqId: BooqId = `uu:${result.id}`
        addUpload(auth.id, booqId)
        const [data] = await booqDataForIds([booqId])
        if (data) {
            return {
                success: true,
                booqId,
                title: data.title ?? undefined,
                cover: data.cover ? {
                    url: urlForBooqImageId(data.booqId, data.cover.id),
                    width: data.cover.width,
                    height: data.cover.height,
                } : undefined,
            } as const
        }
    }
    return {
        success: false,
    } as const
}