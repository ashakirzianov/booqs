import { confirmUploadAction } from '@/data/upload'

export async function POST(request: Request) {
    const { uploadId } = await request.json()

    if (typeof uploadId !== 'string') {
        return Response.json({ error: 'uploadId is required' }, { status: 400 })
    }

    const result = await confirmUploadAction(uploadId)
    return Response.json(result)
}
