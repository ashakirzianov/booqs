'use server'

import { uploadEpubForUser, requestUpload as backendRequestUpload, confirmUpload as backendConfirmUpload } from '@/backend/uu'
import { BooqId } from '@/core'
import { addUpload } from '@/backend/collections'
import { getCurrentUser } from './user'
import { booqDataForIds } from '@/backend/library'

export async function requestUploadAction() {
    const auth = await getCurrentUser()
    if (!auth) {
        return { success: false, error: 'Not authenticated' } as const
    }
    const result = await backendRequestUpload()
    return { success: true, ...result } as const
}

export async function confirmUploadAction(uploadId: string) {
    const auth = await getCurrentUser()
    if (!auth) {
        return { success: false, error: 'Not authenticated' } as const
    }
    return backendConfirmUpload(uploadId, auth.id)
}

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
                coverSrc: data.coverSrc,
            } as const
        }
    }
    return {
        success: false,
    } as const
}