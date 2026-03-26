import { BooqId, BooqRange, BooqNode, BooqStyles } from '@/core'
import { fetchExpandedFragmentForRange } from '@/data/booqs'
import { NextRequest } from 'next/server'

type Params = {
    booq_id: string,
}

export type GetResponse = {
    nodes: BooqNode[],
    styles: BooqStyles,
    range: BooqRange,
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { booq_id } = await params
    const { searchParams } = new URL(request.url)
    const rangeParam = searchParams.get('range')

    if (!rangeParam) {
        return Response.json({ error: 'Missing range parameter' }, { status: 400 })
    }

    let range: BooqRange
    try {
        range = JSON.parse(rangeParam)
        if (!range.start || !range.end || !Array.isArray(range.start) || !Array.isArray(range.end)) {
            throw new Error('Invalid range format')
        }
    } catch {
        return Response.json({ error: 'Invalid range parameter format' }, { status: 400 })
    }

    const result = await fetchExpandedFragmentForRange(booq_id as BooqId, range)

    if (!result) {
        return Response.json({ error: 'Booq not found or fragment could not be retrieved' }, { status: 404 })
    }

    const response: GetResponse = {
        nodes: result.nodes,
        styles: result.styles,
        range: result.range,
    }

    return Response.json(response)
}