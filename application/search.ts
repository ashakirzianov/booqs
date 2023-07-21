import { useState } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

const SearchQuery = gql`query Search($query: String!) {
    search(query: $query, limit: 10) {
        id
        title
        author
        cover(size: 60)
    }
}`
type SearchData = {
    search: {
        id: string,
        title?: string,
        author?: string,
        cover?: string,
    }[],
};
export type SearchResult = SearchData['search'][number];
export function useSearch() {
    const [query, setQuery] = useState('')
    const { loading, data } = useQuery<SearchData>(
        SearchQuery,
        { variables: { query } },
    )

    return {
        query,
        doQuery: setQuery,
        results: data?.search ?? [],
        loading,
    }
}
