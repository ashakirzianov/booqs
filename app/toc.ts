import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { doQuery } from "./provider";
import { BooqNode, BooqPath } from "./core";

const TocQuery = gql`query TocQuery($booqId: ID!) {
    booq(id: $booqId) {
        title
        tableOfContents {
            items {
                title
                position
                path
            }
        }
    }
}`;
type TocData = {
    booq: {
        title?: string,
        tableOfContents: {
            items: {
                title?: string,
                position: number,
                path: BooqPath,
            }[],
        },
    },
};

export type TocItem = TocData['booq']['tableOfContents']['items'][number];
export function useToc(booqId: string) {
    const { loading, data } = useQuery<TocData>(
        TocQuery,
        { variables: { booqId } },
    );

    return {
        loading,
        title: data?.booq.title,
        items: data?.booq.tableOfContents.items ?? [],
    };
}
