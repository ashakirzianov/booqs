import { AnnotationAuthorData } from '@/data/annotations'
import { fetchReplies } from '@/data/replies'
import { NextRequest } from 'next/server'

export type ResolvedReply = {
    id: string,
    annotationId: string,
    author: AnnotationAuthorData,
    content: string,
    createdAt: string,
    updatedAt: string,
}
export type GetResponse = {
    replies: ResolvedReply[],
}
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const annotationId = searchParams.get('annotation_id')
    if (!annotationId) {
        return Response.json({ error: 'Missing annotation_id' }, { status: 400 })
    }
    const replies = await fetchReplies([annotationId])
    const result: GetResponse = { replies }
    return Response.json(result)
}
