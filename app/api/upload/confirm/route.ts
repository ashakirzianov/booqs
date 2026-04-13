import { confirmUpload, primeBooqFile, primeAfterUpload, uploadMissingOriginals } from '@/data/upload'
import { BooqId } from '@/core'
import { after } from 'next/server'

export const maxDuration = 60

type SuccessResponse = { success: true, booqId: string, title?: string, coverSrc?: string }
type ErrorResponse = { success: false, error: string }
export type PostResponse = SuccessResponse | ErrorResponse

export async function POST(request: Request) {
    const { uploadId } = await request.json()

    if (typeof uploadId !== 'string') {
        return Response.json({ error: 'uploadId is required' }, { status: 400 })
    }

    const result = await confirmUpload(uploadId)

    if (!result.success) {
        return Response.json({
            success: false,
            error: result.error,
        } satisfies ErrorResponse)
    }

    const booqId = result.booqId as BooqId
    after(async () => {
        await primeBooqFile(booqId, result.fileBuffer)
        await primeAfterUpload(booqId)
        await uploadMissingOriginals(booqId)
    })

    return Response.json({
        success: true,
        booqId: result.booqId,
        title: result.title,
        coverSrc: result.coverSrc,
    } satisfies SuccessResponse)
}
