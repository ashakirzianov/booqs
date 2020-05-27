import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { BooqPath } from "./core";

const BooqHistoryQuery = gql`query BooqHistory {
    history {
        booq {
            length
        }
        path
        preview
        position
    }
}`;
type BooqHistoryData = {
    history: {
        booq: {
            length: number,
        },
        path: BooqPath,
        preview: string,
        position: number,
    }[],
};

export function useHistory() {
    const { loading, data } = useQuery<BooqHistoryData>(
        BooqHistoryQuery,
    );
    return {
        loading,
        history: (data?.history ?? []).map(h => ({
            path: h.path,
            preview: h.preview,
            position: h.position,
            booqLength: h.booq.length,
        })),
    };
}