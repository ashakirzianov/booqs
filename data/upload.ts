'use server'

import { requestUpload as backendRequestUpload, confirmUpload as backendConfirmUpload } from '@/backend/uu'
import { primeAfterUpload as backendPrimeAfterUpload } from '@/backend/library'
import { setCachedBooqFile } from '@/backend/cache'
import { extractAndUploadMissingOriginals } from '@/backend/variants'
import { BooqId } from '@/core'
import { getCurrentUser } from './user'

export async function requestUpload() {
    const auth = await getCurrentUser()
    if (!auth) {
        return { success: false, error: 'Not authenticated' } as const
    }
    const result = await backendRequestUpload()
    return { success: true, ...result } as const
}

export type ConfirmUploadResponse =
    | { success: true, booqId: string, title?: string, coverSrc?: string, fileBuffer: Buffer }
    | { success: false, error: string }

export async function confirmUpload(uploadId: string): Promise<ConfirmUploadResponse> {
    const auth = await getCurrentUser()
    if (!auth) {
        return { success: false, error: 'Not authenticated' }
    }
    return backendConfirmUpload(uploadId, auth.id)
}

export async function primeBooqFile(booqId: BooqId, fileBuffer: Buffer) {
    setCachedBooqFile(booqId, { kind: 'epub', file: fileBuffer })
}

export async function primeAfterUpload(booqId: BooqId) {
    await backendPrimeAfterUpload(booqId)
}

export async function uploadMissingOriginals(booqId: BooqId) {
    await extractAndUploadMissingOriginals(booqId)
}