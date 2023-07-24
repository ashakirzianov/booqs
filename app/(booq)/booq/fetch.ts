import { fetchQuery } from '@/application/server'
import { BooqNode, BooqPath, pathFromString } from '@/core'
import gql from 'graphql-tag'

export type BooqData = Exclude<Awaited<ReturnType<typeof fetchBooqFragmentServer>>, undefined>
export async function fetchBooqFragmentServer(id: string, path: BooqPath | undefined) {
    const BooqFragmentQuery = gql`query BooqFragment($id: ID!, $path: [Int!]) {
        booq(id: $id) {
            id
            title
            length
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