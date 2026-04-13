import { BooqId } from '@/core'
import { requestUpload, confirmUpload } from '@/data/upload'
import { useState } from 'react'

export type FileData = File

type UploadState = {
    state: 'not-started',
} | {
    state: 'loading',
    progress: number,
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

export function useUpload() {
    const [state, setState] = useState<UploadState>({
        state: 'not-started',
    })
    async function uploadFile(file: FileData) {
        function setProgress(progress: number) {
            setState({ state: 'loading', progress })
        }
        setProgress(0)
        const result = await uploadViaPresignedUrl(file, setProgress)
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
        isLoading: state.state === 'loading',
        progress: state.state === 'loading' ? state.progress : undefined,
        result: state.state === 'success' ? state.data : undefined,
        error: state.state === 'error' ? state.error : undefined,
    }
}

async function uploadViaPresignedUrl(file: File, setProgress: (progress: number) => void) {
    try {
        setProgress(10)
        const requestResult = await requestUpload()
        if (!requestResult.success) {
            return { success: false, error: requestResult.error } as const
        }

        setProgress(20)
        const putResponse = await fetch(requestResult.uploadUrl, {
            method: 'PUT',
            body: file,
        })
        if (!putResponse.ok) {
            return { success: false, error: 'Failed to upload file' } as const
        }

        setProgress(70)
        const result = await confirmUpload(requestResult.uploadId)
        setProgress(100)
        return result
    } catch {
        return { success: false, error: 'Upload failed. Please try again.' } as const
    }
}
