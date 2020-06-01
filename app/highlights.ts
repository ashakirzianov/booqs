import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { BooqPath, uuid } from "core";

const HighlightsQuery = gql`query HighlightsQuery($bookId: ID!) {
    booq(id: $bookId) {
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

const AddHighlightMutation = gql`mutation AddHighlight($highlight: HighlightInput) {
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
                        }
                    }
                },
            });
        },
    };
}

const groupColorMapping: {
    [group in string]: string | undefined;
} = {
    first: 'yellow',
    second: 'blue',
    third: 'pink',
    forth: 'violet',
};
export function groups() {
    return Object.keys(groupColorMapping);
}
export function colorForGroup(group: string) {
    return groupColorMapping[group] ?? 'yellow';
}