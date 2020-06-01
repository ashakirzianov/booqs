import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { BooqPath, uuid } from "core";

const HighlightsQuery = gql`query HighlightsQuery($booqId: ID!) {
    booq(id: $booqId) {
        id
        highlights {
            id
            start
            end
            group
        }
    }
}`;
type HighlightsData = {
    booq: {
        id: string,
        highlights: {
            __typename: 'BooqHighlight',
            id: string,
            start: BooqPath,
            end: BooqPath,
            group: string,
        }[],
    },
};
export function useHighlights(booqId: string) {
    const { loading, data } = useQuery<HighlightsData>(
        HighlightsQuery,
        { variables: { booqId } },
    );
    return {
        loading,
        highlights: (data?.booq.highlights ?? []),
    };
}

const AddHighlightMutation = gql`mutation AddHighlight($highlight: HighlightInput!) {
    addHighlight(highlight: $highlight)
}`;
type AddHighlightData = { addHighlight: boolean };
type AddHighlightVars = {
    highlight: {
        id: string,
        booqId: string,
        group: string,
        start: BooqPath,
        end: BooqPath,
    },
};
export function useHighlightMutations(booqId: string) {
    const [add] = useMutation<AddHighlightData, AddHighlightVars>(
        AddHighlightMutation,
    );
    return {
        addHighlight(input: {
            start: BooqPath,
            end: BooqPath,
            group: string,
        }) {
            const id = uuid();
            add({
                variables: { highlight: { ...input, booqId, id } },
                optimisticResponse: { addHighlight: true },
                update(cache, { data }) {
                    if (data?.addHighlight) {
                        const cached = cache.readQuery<HighlightsData>({
                            query: HighlightsQuery,
                            variables: { booqId },
                        });
                        if (cached) {
                            cached.booq.highlights.push({
                                ...input,
                                __typename: 'BooqHighlight',
                                id,
                            });
                            cache.writeQuery({
                                query: HighlightsQuery,
                                variables: { booqId },
                                data: cached,
                            });
                        }
                    }
                },
            });
        },
    };
}

const defaultColor = 'rgba(255, 215, 0, 0.6)';
const groupColorMapping: {
    [group in string]: string | undefined;
} = {
    first: defaultColor,
    second: 'rgba(135, 206, 235, 0.6)',
    third: 'rgba(240, 128, 128, 0.6)',
    forth: 'rgba(75, 0, 130, 0.6)',
};
export function colorForGroup(group: string) {
    return groupColorMapping[group] ?? defaultColor;
}
export const quoteColor = 'rgba(255, 165, 0, 0.6)'