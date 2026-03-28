import { BooqId } from '@/core'
import { fetchImageVariant, uploadMissingOriginals } from '@/data/variants'
import { after } from 'next/server'
import { NextRequest } from 'next/server'

export const maxDuration = 60

type Params = {
    booq_id: string,
    file_path: string[],
}

export async function GET(_request: NextRequest, { params }: { params: Promise<Params> }) {
    const { booq_id, file_path } = await params
    const booqId = booq_id as BooqId
    const filePathWithVariant = file_path.join('/')

    const result = await fetchImageVariant(booqId, filePathWithVariant)
    if (!result) {
        return new Response('Image not found', { status: 404 })
    }

    if (result.extracted) {
        after(() => uploadMissingOriginals(booqId))
    }

    return new Response(new Uint8Array(result.buffer), {
        headers: {
            'Content-Type': result.contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    })
}
