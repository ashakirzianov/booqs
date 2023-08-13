import gql from 'graphql-tag'
import { BooqNode, BooqPath } from '@/core'
import { fetchQuery } from '@/application/server'

export async function fetchFeaturedIds() {
    const FeaturedQuery = gql`query Featured {
        featured(limit: 10) {
            id
        }
    }`
    type FeaturedData = {
        featured: {
            id: string,
        }[],
    };

    const result = await fetchQuery<FeaturedData>({
        query: FeaturedQuery,
    })
    const featured = result.success
        ? result.data?.featured ?? []
        : []
    return featured
        .filter(f => f !== null && f !== undefined)
}

export async function fetchBooqFragment(id: string, path?: BooqPath) {
    const BooqFragmentQuery = gql`query BooqFragment($id: ID!, $path: [Int!]) {
        booq(id: $id) {
            id
            title
            author
            language
            length
            preview(path: $path)
            fragment(path: $path) {
                nodes
                previous {
                    title
                    path
                }
                current {
                    path
                }
                next {
                    title
                    path
                }
            }
        }
    }`
    type BooqFragmentData = {
        booq: {
            id: string,
            title?: string,
            author?: string,
            language?: string,
            length: number,
            preview: string,
            fragment: {
                nodes: BooqNode[],
                previous?: BooqAnchor,
                current: BooqAnchor,
                next?: BooqAnchor,
            }
        },
    };
    type BooqAnchor = {
        title?: string,
        path: BooqPath,
    };
    const result = await fetchQuery<BooqFragmentData>({
        query: BooqFragmentQuery,
        variables: {
            id, path,
        },
    })
    if (result.success) {
        return result.data.booq
    } else {
        console.error(result.error)
        return undefined
    }
}

export async function fetchBooqMeta(id: string, start?: BooqPath, end?: BooqPath) {
    const BooqMetaQuery = gql`query BooqMeta($id: ID!, $start: [Int!], $end: [Int!]) {
        booq(id: $id) {
            title
            preview(path: $start, end: $end)
        }
    }`
    type BooqMetaData = {
        booq: {
            title?: string,
            preview: string,
        },
    };
    type BooqMetaVars = {
        id: string,
        start?: BooqPath,
        end?: BooqPath,
    }
    const result = await fetchQuery<BooqMetaData, BooqMetaVars>({
        query: BooqMetaQuery,
        variables: {
            id, start, end
        },
    })
    if (result.success) {
        return result.data.booq
    } else {
        console.error(result.error)
        return undefined
    }
}
