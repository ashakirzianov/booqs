import { useQuery, gql } from '@apollo/client'
import { BooqPath } from '@/core'

const TocQuery = gql`query TocQuery($booqId: ID!) {
    booq(id: $booqId) {
        id
        title
        tableOfContents {
            title
            position
            path
            level
        }
    }
}`
type TocData = {
    booq: {
        title?: string,
        tableOfContents: {
            title: string,
            position: number,
            level: number,
            path: BooqPath,
        }[],
    },
};

export type TocItem = TocData['booq']['tableOfContents'][number];
export function useToc(booqId: string) {
    const { loading, data } = useQuery<TocData>(
        TocQuery,
        { variables: { booqId } },
    )

    return {
        loading,
        title: data?.booq.title,
        toc: data?.booq.tableOfContents ?? [],
    }
}
