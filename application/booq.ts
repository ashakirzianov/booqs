import { useQuery, gql } from '@apollo/client'
import { doQuery } from './provider'
import { BooqNode, BooqPath } from '@/core'

const BooqFragmentQuery = gql`query BooqFragment($id: ID!, $path: [Int!]) {
    booq(id: $id) {
        id
        title
        author
        language
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
        author?: string,
        language?: string,
        length: number,
        fragment: {
            nodes: BooqNode[],
            previous?: BooqAnchor,
            current: BooqAnchor,
            next?: BooqAnchor,
        }
    },
};
export type BooqAnchor = {
    title?: string,
    path: BooqPath,
};
export type BooqData = BooqFragmentData['booq'];

export async function fetchBooqFragment(id: string, path?: BooqPath) {
    const result = await doQuery<BooqFragmentData>({
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

export function useBooq(id: string, path?: BooqPath) {
    const { loading, data } = useQuery<BooqFragmentData>(
        BooqFragmentQuery,
        { variables: { id, path } },
    )

    return {
        loading,
        booq: data?.booq,
    }
}
