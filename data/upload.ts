'use server'

import { requestUpload as backendRequestUpload, confirmUpload as backendConfirmUpload } from '@/backend/uu'
import { getCurrentUser } from './user'

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