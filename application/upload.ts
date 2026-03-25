import { BooqId } from '@/core'
import { requestUploadAction, confirmUploadAction } from '@/data/upload'
import { useState } from 'react'

export type FileData = File

export function useUpload() {
    type UploadState = {
        state: 'not-started',
    } | {
        state: 'loading',
    } | {
        state: 'error',
        error: string,
    } | {
        state: 'success',
        data: {
            booqId: BooqId,
            title: string | undefined,
            coverSrc?: string,
        },
    }
    const [state, setState] = useState<UploadState>({
        state: 'not-started',
    })
    async function uploadFile(file: FileData) {
        setState({ state: 'loading' })
        const result = await uploadViaPresignedUrl(file)
        if (result.success) {
            setState({
                state: 'success',
                data: {
                    booqId: result.booqId as BooqId,
                    title: result.title,
                    coverSrc: result.coverSrc,
                }
            })
        } else {
            setState({
                state: 'error',
                error: result.error ?? 'Unknown error',
            })
        }
        return result
    }
    return {
        uploadFile,
        loading: state.state === 'loading',
        result: state.state === 'success' ? state.data : undefined,
        error: state.state === 'error' ? state.error : undefined,
    }
}

async function uploadViaPresignedUrl(file: File) {
    try {
        const requestResult = await requestUploadAction()
        if (!requestResult.success) {
            return { success: false, error: requestResult.error } as const
        }

        const putResponse = await fetch(requestResult.uploadUrl, {
            method: 'PUT',
            body: file,
        })
        if (!putResponse.ok) {
            return { success: false, error: 'Failed to upload file' } as const
        }

        return await confirmUploadAction(requestResult.uploadId)
    } catch {
        return { success: false, error: 'Upload failed. Please try again.' } as const
    }
}
