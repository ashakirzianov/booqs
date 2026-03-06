import { BooqId } from '@/core'
import { fetchImageVariant } from '@/data/images'
import { NextRequest } from 'next/server'

type Params = {
    booq_id: string,
    file_path: string[],
}

export async function GET(_request: NextRequest, { params }: { params: Promise<Params> }) {
    const { booq_id, file_path } = await params
    const filePathWithVariant = file_path.join('/')

    const result = await fetchImageVariant(booq_id as BooqId, filePathWithVariant)
    if (!result) {
        return new Response('Image not found', { status: 404 })
    }

    return new Response(result.buffer, {
        headers: {
            'Content-Type': result.contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    })
}
