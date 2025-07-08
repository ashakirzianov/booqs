import { searchBooqs } from '@/backend/library'
import { SearchResultData, toClientSearchResult } from '@/data/search'
import { NextRequest } from 'next/server'

export type GetResponse = {
    query: string,
    results: SearchResultData[],
}
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') ?? '10')
    if (!query) {
        return new Response('Query is required', { status: 400 })
    }
    const results = await searchBooqs(query, limit)
    const response: GetResponse = {
        query,
        results: results.map(toClientSearchResult),
    }
    return Response.json(response)
}