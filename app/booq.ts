import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { doQuery } from "./provider";

const BooqNodesQuery = gql`query BooqNodes($id: ID!) {
    booq(id: $id) {
        title
        nodesConnection {
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

export type BooqNodeAttrs = {
    [name in string]?: string;
};
export type BooqNodeStyle = {
    [name in string]?: string;
};
export type BooqNode = {
    name?: string,
    id?: string,
    style?: BooqNodeStyle,
    children?: BooqNode[],
    attrs?: BooqNodeAttrs,
    content?: string,
    offset?: number,
}
export type Booq = BooqNodesData['booq'];

export async function fetchBooq(id: string) {
    const result = await doQuery<BooqNodesData>({
        query: BooqNodesQuery,
        variables: { id, all: true },
    });
    if (result.data) {
        return result.data.booq;
    } else {
        return undefined;
    }
}

export function useBooq(id: string) {
    const { loading, data } = useQuery<BooqNodesData>(
        BooqNodesQuery,
        { variables: { id } },
    );

    return {
        loading,
        booq: data?.booq,
    };
}
