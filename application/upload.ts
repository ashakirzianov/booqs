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
            id: string,
            title?: string,
            cover?: string,
        },
    }
    const [state, setState] = useState<UploadState>({
        state: 'not-started',
    })
    async function uploadFile(file: FileData) {
        console.log('uploading file', file)
        setState({
            state: 'loading',
        })
        const result = await uploadEpubAction(file)
        if (result.success) {
            setState({
                state: 'success',
                data: {
                    id: result.id,
                    title: result.title,
                    cover: result.cover,
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
