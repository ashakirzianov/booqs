import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { BooqPath, uniqueId } from "core";
import { UserData } from "./auth";

const HighlightsQuery = gql`query HighlightsQuery($booqId: ID!) {
    booq(id: $booqId) {
        id
        highlights {
            id
            start
            end
            group
            text
            position
            author {
                id
                name
                pictureUrl
            }
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
            text: string,
            position: number | null,
            author: {
                id: string,
                name: string,
                pictureUrl: string | null,
            },
        }[],
    },
};
export type Highlight = HighlightsData['booq']['highlights'][number];
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
const RemoveHighlightMutation = gql`mutation RemoveHighlight($id: ID!) {
    removeHighlight(id: $id)
}`;
type RemoveHighlightData = { removeHighlight: boolean };
type RemoveHighlightVars = { id: string };

const UpdateHighlightMutation = gql`mutation UpdateHighlight($id: ID!, $group: String) {
    updateHighlight(id: $id, group: $group)
}`;
type UpdateHighlightData = { updateHighlight: boolean };
type UpdateHighlightVars = { id: string, group?: string };

export function useHighlightMutations(booqId: string) {
    const [add] = useMutation<AddHighlightData, AddHighlightVars>(
        AddHighlightMutation,
    );
    const [remove] = useMutation<RemoveHighlightData, RemoveHighlightVars>(
        RemoveHighlightMutation,
    );
    const [update] = useMutation<UpdateHighlightData, UpdateHighlightVars>(
        UpdateHighlightMutation,
    );
    return {
        addHighlight(input: {
            start: BooqPath,
            end: BooqPath,
            group: string,
            text: string,
            author: UserData,
        }): Highlight {
            const highlight = {
                booqId,
                id: uniqueId(),
                start: input.start,
                end: input.end,
                group: input.group,
            };
            const created = {
                ...input,
                __typename: 'BooqHighlight',
                id: highlight.id,
                position: null,
                author: {
                    id: input.author.id,
                    name: input.author.name,
                    pictureUrl: input.author.pictureUrl ?? null,
                },
            } as const;
            add({
                variables: { highlight },
                optimisticResponse: { addHighlight: true },
                update(cache, { data }) {
                    if (data?.addHighlight) {
                        const cached = cache.readQuery<HighlightsData>({
                            query: HighlightsQuery,
                            variables: { booqId },
                        });
                        if (cached) {
                            cached.booq.highlights.unshift(created);
                            cache.writeQuery({
                                query: HighlightsQuery,
                                variables: { booqId },
                                data: cached,
                            });
                        }
                    }
                },
            });
            return created;
        },
        removeHighlight(id: string) {
            remove({
                variables: { id },
                optimisticResponse: { removeHighlight: true },
                update(cache, { data }) {
                    if (data?.removeHighlight) {
                        const cached = cache.readQuery<HighlightsData>({
                            query: HighlightsQuery,
                            variables: { booqId },
                        });
                        if (cached) {
                            cached.booq.highlights = cached.booq.highlights.filter(
                                h => h.id !== id,
                            );
                            cache.writeQuery<HighlightsData>({
                                query: HighlightsQuery,
                                variables: { booqId },
                                data: cached,
                            });
                        }
                    }
                }
            })
        },
        updateHighlight(id: string, group: string) {
            update({
                variables: { id, group },
                optimisticResponse: { updateHighlight: true },
                update(cache, { data }) {
                    if (data?.updateHighlight) {
                        const cached = cache.readQuery<HighlightsData>({
                            query: HighlightsQuery,
                            variables: { booqId },
                        });
                        if (cached) {
                            const target = cached.booq.highlights.find(
                                h => h.id === id,
                            );
                            if (target) {
                                target.group = group;
                                cache.writeQuery<HighlightsData>({
                                    query: HighlightsQuery,
                                    variables: { booqId },
                                    data: cached,
                                });
                            }
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
    fifth: 'rgba(34, 139, 34, 0.6)',
};
export function colorForGroup(group: string) {
    return groupColorMapping[group] ?? defaultColor;
}
export const quoteColor = 'rgba(255, 165, 0, 0.6)';
export const groups = Object.keys(groupColorMapping);