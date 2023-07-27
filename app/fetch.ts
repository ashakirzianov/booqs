import gql from 'graphql-tag'
import { BooqNode, BooqPath } from '@/core'
import { fetchQuery } from '@/application/server'

export async function fetchFeaturedServer() {
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

    const result = await fetchQuery<FeaturedData>({
        query: FeaturedQuery,
    })
    return (result.data?.featured ?? [])
        .filter(f => f !== null && f !== undefined)
}

export type BooqData = Exclude<Awaited<ReturnType<typeof fetchBooqFragmentServer>>, undefined>
export async function fetchBooqFragmentServer(id: string, path?: BooqPath) {
    const BooqFragmentQuery = gql`query BooqFragment($id: ID!, $path: [Int!]) {
        booq(id: $id) {
            id
            title
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
    type BooqData = BooqFragmentData['booq'];
    const result = await fetchQuery<BooqFragmentData>({
        query: BooqFragmentQuery,
        variables: {
            id, path,
        },
    })
    if (result.data) {
        return result.data.booq
    } else {
        return undefined
    }
}
