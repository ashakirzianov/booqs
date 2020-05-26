import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { doQuery } from "./provider";
import { BooqNode, BooqPath } from "./core";

const TocQuery = gql`query TocQuery($booqId: ID!) {
    booq(id: $booqId) {
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
        tableOfContents: {
            items: {
                title?: string,
                position: number,
                path: BooqPath,
            }[],
        },
    },
};

export function useToc(booqId: string) {
    const { loading, data } = useQuery<TocData>(
        TocQuery,
        { variables: { booqId } },
    );

    return {
        loading,
        items: data?.booq.tableOfContents.items ?? [],
    };
}
