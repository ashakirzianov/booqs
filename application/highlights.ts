import { useQuery, useMutation, gql } from '@apollo/client'
import { BooqPath, uniqueId } from '@/core'
import { User } from './auth'

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
}`
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
                __typename: 'User',
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
    )
    return {
        loading,
        highlights: (data?.booq.highlights ?? []),
    }
}

const AddHighlightMutation = gql`mutation AddHighlight($highlight: HighlightInput!) {
    addHighlight(highlight: $highlight)
}`
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
}`
type RemoveHighlightData = { removeHighlight: boolean };
type RemoveHighlightVars = { id: string };

const UpdateHighlightMutation = gql`mutation UpdateHighlight($id: ID!, $group: String) {
    updateHighlight(id: $id, group: $group)
}`
type UpdateHighlightData = { updateHighlight: boolean };
type UpdateHighlightVars = { id: string, group?: string };

export function useHighlightMutations(booqId: string) {
    const [add] = useMutation<AddHighlightData, AddHighlightVars>(
        AddHighlightMutation,
    )
    const [remove] = useMutation<RemoveHighlightData, RemoveHighlightVars>(
        RemoveHighlightMutation,
    )
    const [update] = useMutation<UpdateHighlightData, UpdateHighlightVars>(
        UpdateHighlightMutation,
    )
    return {
        addHighlight(input: {
            start: BooqPath,
            end: BooqPath,
            group: string,
            text: string,
            author: User,
        }): Highlight {
            const highlight = {
                booqId,
                id: uniqueId(),
                start: input.start,
                end: input.end,
                group: input.group,
            }
            const created: Highlight = {
                ...input,
                __typename: 'BooqHighlight',
                id: highlight.id,
                position: null,
                author: {
                    __typename: 'User',
                    id: input.author.id,
                    name: input.author.name,
                    pictureUrl: input.author.pictureUrl ?? null,
                },
            } as const
            add({
                variables: { highlight },
                optimisticResponse: { addHighlight: true },
                update(cache, { data }) {
                    if (data?.addHighlight) {
                        let cached = cache.readQuery<HighlightsData>({
                            query: HighlightsQuery,
                            variables: { booqId },
                        })
                        if (cached) {
                            cached = {
                                ...cached,
                                booq: {
                                    ...cached.booq,
                                    highlights: [created, ...cached.booq.highlights],
                                },
                            }
                            cache.writeQuery({
                                query: HighlightsQuery,
                                variables: { booqId },
                                data: cached,
                            })
                        }
                    }
                },
            })
            return created
        },
        removeHighlight(id: string) {
            remove({
                variables: { id },
                optimisticResponse: { removeHighlight: true },
                update(cache, { data }) {
                    if (data?.removeHighlight) {
                        let cached = cache.readQuery<HighlightsData>({
                            query: HighlightsQuery,
                            variables: { booqId },
                        })
                        if (cached) {
                            cached = {
                                ...cached,
                                booq: {
                                    ...cached.booq,
                                    highlights: cached.booq.highlights.filter(
                                        h => h.id !== id,
                                    ),
                                },
                            }
                            cache.writeQuery<HighlightsData>({
                                query: HighlightsQuery,
                                variables: { booqId },
                                data: cached,
                            })
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
                        let cached = cache.readQuery<HighlightsData>({
                            query: HighlightsQuery,
                            variables: { booqId },
                        })
                        if (cached) {
                            const target = cached.booq.highlights.find(
                                h => h.id === id,
                            )
                            if (target) {
                                cached = {
                                    ...cached,
                                    booq: {
                                        ...cached.booq,
                                        highlights: cached.booq.highlights.map(
                                            h => h.id === id ? { ...h, group } : h,
                                        ),
                                    },
                                }
                                cache.writeQuery<HighlightsData>({
                                    query: HighlightsQuery,
                                    variables: { booqId },
                                    data: cached,
                                })
                            }
                        }
                    }
                },
            })
        },
    }
}