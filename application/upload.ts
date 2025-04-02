import { useState } from 'react'

export type FileData = File

export function useUpload() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<UploadResult | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    async function uploadFile(file: FileData) {
        setLoading(true)
        setResult(undefined)
        setError(undefined)
        const result = await fetchUploadFile(file)
        if (result.success) {
            setResult(result.data)
        } else {
            setError(result.error)
        }
        setLoading(false)
        return result
    }
    return {
        uploadFile, loading, result, error,
    }
}

type UploadResult = {
    id: string,
    title?: string,
    cover?: string,
}
async function fetchUploadFile(file: FileData) {
    const back = process.env.NEXT_PUBLIC_BACKEND
    if (back === undefined)
        throw new Error('NEXT_PUBLIC_BACKEND is undefined')
    const url = `${back}/upload`
    try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        })
        if (response.ok) {
            const result: UploadResult = await response.json()
            if (!result?.id) {
                return {
                    success: false,
                    error: `Upload failed: no id returned: ${result}`,
                }
            }
            return {
                success: true,
                data: result,
            }
        } else {
            return {
                success: false,
                error: `Upload failed with ${response.status}: ${response.statusText}`,
            }
        }
    } catch (err) {
        const message = (err as any)?.message ?? 'Unknown error'
        return {
            success: false,
            error: `An error occurred: ${message}`,
        }
    }
}
