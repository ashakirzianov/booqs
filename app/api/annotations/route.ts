import {
    AnnotationAuthorData,
    fetchAnnotations,
    AnnotationPrivacy,
} from '@/data/annotations'
import { BooqId, BooqLocator } from '@/core'
import { NextRequest } from 'next/server'

export type ResolvedAnnotation = {
    id: string,
    booqId: BooqId,
    author: AnnotationAuthorData,
    locator: BooqLocator,
    kind: string,
    color?: string,
    content?: string,
    privacy: AnnotationPrivacy,
    createdAt: string,
    updatedAt: string,
}
export type GetResponse = {
    annotations: ResolvedAnnotation[],
}
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const booq_id = searchParams.get('booq_id')
    if (!booq_id) {
        return Response.json({ error: 'Missing booq_id' }, { status: 400 })
    }
    const booqId: BooqId = booq_id as BooqId
    const annotations = await fetchAnnotations({ booqId })
    const result: GetResponse = {
        annotations,
    }
    return Response.json(result)
}
