import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { doQuery } from "./provider";
import { BooqNode, BooqPath, pathToString } from "./common";

const BooqNodesQuery = gql`query BooqNodes($id: ID!, $all: Boolean, $after: String, $before: String) {
    booq(id: $id) {
        title
        nodesConnection(all: $all, after: $after, before: $before) {
            edges {
                node
            }
        }
    }
}`;
type BooqNodesData = {
    booq: {
        title?: string,
        nodesConnection: {
            edges: {
                node: BooqNode,
            }[],
        },
    },
};
export type Booq = BooqNodesData['booq'];

export async function fetchBooq(id: string, path?: BooqPath) {
    const result = await doQuery<BooqNodesData>({
        query: BooqNodesQuery,
        variables: {
            id,
            all: path ? false : true,
            path: path ? pathToString(path) : undefined,
        },
    });
    if (result.data) {
        return result.data.booq;
    } else {
        return undefined;
    }
}

export function useBooq(id: string, path?: BooqPath) {
    const after = path && pathToString(path);
    const { loading, data } = useQuery<BooqNodesData>(
        BooqNodesQuery,
        { variables: { id, after } },
    );

    return {
        loading,
        booq: data?.booq,
    };
}
