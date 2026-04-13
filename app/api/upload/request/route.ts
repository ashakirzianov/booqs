import { requestUpload } from '@/data/upload'

export async function POST() {
    const result = await requestUpload()
    if (!result.success) {
        return Response.json({ error: result.error }, { status: 401 })
    }

    return Response.json({
        uploadId: result.uploadId,
        uploadUrl: result.uploadUrl,
    })
}
