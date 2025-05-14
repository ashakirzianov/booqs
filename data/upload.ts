'use server'

import { uploadEpubBook } from '@/backend/upload'
import { fetchAuthData } from './auth'

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
    const result = await uploadEpubBook(buffer, auth.id)
    if (result.success && result.booqId) {
        return {
            success: true,
            booqId: result.booqId,
            title: result.title ?? undefined,
            coverUrl: result.coverUrl ?? undefined,
        } as const
    } else {
        return {
            success: false,
            error: result.error,
        } as const
    }
}