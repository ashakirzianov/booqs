import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

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
