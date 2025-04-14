'use server'

import { uploadEpubBook } from '@/backend/upload'
import { fetchAuthData } from './auth'

export async function uploadEpubAction(file: File) {
    console.log('uploading file', file)
    const auth = await fetchAuthData()
    if (!auth) {
        return {
            success: false,
            error: 'Not authenticated',
        } as const
    }
    console.log('auth', auth)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('buffer')
    const result = await uploadEpubBook(buffer, auth.id)
    if (result.success && result.id) {
        return {
            success: true,
            id: result.id,
            title: result.title,
            cover: result.cover,
        } as const
    } else {
        return {
            success: false,
            error: result.error,
        } as const
    }
}