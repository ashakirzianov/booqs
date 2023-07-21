import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { doQuery } from './provider'

const FeaturedQuery = gql`query Featured {
    featured(limit: 10) {
        id
        title
        author
        cover(size: 210)
        tags {
            tag
            value
        }
    }
}`
type FeaturedData = {
    featured: {
        id: string,
        title?: string,
        author?: string,
        cover?: string,
        tags: {
            tag: string,
            value?: string,
        }[],
    }[],
};
export type FeaturedItem = FeaturedData['featured'][number];
export function useFeatured() {
    const { loading, data } = useQuery<FeaturedData>(FeaturedQuery)
    return {
        loading,
        cards: (data?.featured ?? []),
    }
}

export async function fetchFeatured() {
    const result = await doQuery<FeaturedData>({
        query: FeaturedQuery,
    })
    return (result.data?.featured ?? [])
        .filter(f => f !== null && f !== undefined)
}
