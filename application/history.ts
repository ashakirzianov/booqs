import { useQuery, useMutation, gql } from '@apollo/client'
import { BooqPath } from '@/core'
import { currentSource } from './common'

const BooqHistoryQuery = gql`query BooqHistory {
    history {
        booq {
            id
            title
            length
        }
        path
        preview
        position
    }
}`
type BooqHistoryData = {
    history: {
        booq: {
            id: string,
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
    )
    return {
        loading,
        history: (data?.history ?? []).map(h => ({
            id: h.booq.id,
            title: h.booq.title,
            path: h.path,
            preview: h.preview,
            position: h.position,
            length: h.booq.length,
        })),
    }
}

const ReportHistoryMutation = gql`mutation ReportBooqHistory($event: BooqHistoryInput!) {
    addBooqHistory(event: $event)
}`
type ReportHistoryData = { addBooqHistory: boolean };
type ReportHistoryVariables = {
    event: {
        booqId: string,
        source: string,
        path: BooqPath,
    },
};
type HistoryEvent = Omit<ReportHistoryVariables['event'], 'source'>;
export function useReportHistory() {
    const [report] = useMutation<ReportHistoryData, ReportHistoryVariables>(
        ReportHistoryMutation,
    )
    return {
        reportHistory(event: HistoryEvent) {
            report({
                variables: {
                    event: {
                        ...event,
                        source: currentSource(),
                    },
                },
            })
        },
    }
}