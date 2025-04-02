import { useState } from 'react'
import { useQuery, gql } from '@apollo/client'

const SearchQuery = gql`query Search($query: String!) {
    search(query: $query, limit: 10) {
        __typename
        ... on Booq {
            id
            title
            author
            cover(size: 60)
        }
        ... on Author {
            name
        }
    }
}`
export type BooqSearchResult = {
    __typename: 'Booq',
    id: string,
    title?: string,
    author?: string,
    cover?: string,
}
export type AuthorSearchResult = {
    __typename: 'Author',
    name: string,
}
export type SearchResult = BooqSearchResult | AuthorSearchResult
type SearchData = {
    search: SearchResult[],
}
export function useSearch() {
    const [query, setQuery] = useState('')
    const { loading, data } = useQuery<SearchData>(
        SearchQuery,
        {
            variables: { query },
            // nextFetchPolicy: 'network-only',
            // fetchPolicy: 'network-only',
        },
    )

    return {
        query,
        doQuery: setQuery,
        results: data?.search ?? [],
        loading,
    }
}

export function isBooqSearchResult(result: SearchResult): result is BooqSearchResult {
    return result.__typename === 'Booq'
}

export function isAuthorSearchResult(result: SearchResult): result is AuthorSearchResult {
    return result.__typename === 'Author'
}
