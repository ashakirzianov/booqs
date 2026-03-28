import { booqSearch, SearchResultData } from '@/data/booqs'
import { NextRequest } from 'next/server'

export type GetResponse = {
    query: string,
    results: SearchResultData[],
}
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10') ?? 10, 100)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0') ?? 0, 0)
    const libraryId = searchParams.get('libraryId') ?? 'pg'
    if (!query) {
        return new Response('Query is required', { status: 400 })
    }
    const results = await booqSearch({ query, libraryId, limit, offset })
    const response: GetResponse = {
        query,
        results,
    }
    return Response.json(response)
}