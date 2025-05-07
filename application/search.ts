import { GetResponse } from '@/app/api/search/route'
import useSWR from 'swr'

export function useSearch({ query }: {
    query: string,
}) {
    const shouldFetch = query.trim().length > 0
    const { data, error, isLoading } = useSWR(
        shouldFetch ? `/api/search?query=${query}` : null,
        async function (url: string) {
            const res = await fetch(url)
            if (!res.ok) {
                throw new Error('Failed to fetch')
            }
            const result: GetResponse = await res.json()
            return result
        },
    )
    return {
        query: data?.query ?? '',
        results: data?.results ?? [],
        isLoading,
        error,
    }
}