import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { BooqPath } from "./core";

const BooqHistoryQuery = gql`query BooqHistory {
    history {
        booq {
            title
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
            title?: string,
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
        { fetchPolicy: 'cache-and-network' },
    );
    return {
        loading,
        history: (data?.history ?? []).map(h => ({
            title: h.booq.title,
            path: h.path,
            preview: h.preview,
            position: h.position,
            length: h.booq.length,
        })),
    };
}

const ReportHistoryMutation = gql`mutation ReportBooqHistory($event: BooqHistoryInput!) {
    addBooqHistory(event: $event)
}`;
type ReportHistoryData = { addBooqHistory: boolean };
type ReportHistoryVariables = {
    event: {
        booqId: string,
        source: string,
        path: BooqPath,
    },
};
export function useReportHistory() {
    const [report] = useMutation<ReportHistoryData, ReportHistoryVariables>(
        ReportHistoryMutation,
    );
    return {
        reportHistory(event: ReportHistoryVariables['event']) {
            report({
                variables: { event },
            });
        },
    };
}