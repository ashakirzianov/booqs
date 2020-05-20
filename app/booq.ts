import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { query } from "./provider";

const BooqNodesQuery = gql`query BooqNodes($id: ID!) {
    booq(id: $id) {
        title
    }
}`;
type BooqNodesData = {
    booq: {
        title?: string,
    },
};

export type Booq = BooqNodesData['booq'];

export async function fetchBooq(id: string) {
    const result = await query<BooqNodesData>({
        query: BooqNodesQuery,
        variables: { id },
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
