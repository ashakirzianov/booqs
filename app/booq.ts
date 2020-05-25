import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { doQuery } from "./provider";
import { BooqNode, BooqPath } from "./common";

const BooqFragmentQuery = gql`query BooqFragment($id: ID!, $path: [Int!]) {
    booq(id: $id) {
        title
        fragment(path: $path) {
            nodes
        }
    }
}`;
type BooqFragmentData = {
    booq: {
        title?: string,
        fragment: {
            nodes: BooqNode[],
        }
    },
};
export type BooqFragment = BooqFragmentData['booq'];

export async function fetchBooqFragment(id: string, path?: BooqPath) {
    const result = await doQuery<BooqFragmentData>({
        query: BooqFragmentQuery,
        variables: {
            id, path,
        },
    });
    if (result.data) {
        return result.data.booq;
    } else {
        return undefined;
    }
}

export function useBooq(id: string, path?: BooqPath) {
    const { loading, data } = useQuery<BooqFragmentData>(
        BooqFragmentQuery,
        { variables: { id, path } },
    );

    return {
        loading,
        booq: data?.booq,
    };
}
