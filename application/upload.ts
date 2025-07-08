import { BooqId } from '@/core'
import { uploadEpubAction } from '@/data/upload'
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
            coverUrl: string | undefined,
        },
    }
    const [state, setState] = useState<UploadState>({
        state: 'not-started',
    })
    async function uploadFile(file: FileData) {
        setState({
            state: 'loading',
        })
        const result = await uploadEpubAction(file)
        if (result.success) {
            setState({
                state: 'success',
                data: {
                    booqId: result.booqId,
                    title: result.title,
                    coverUrl: result.coverUrl,
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
