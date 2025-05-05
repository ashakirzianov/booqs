'use client'

import type { GetResponse, PostBody, PostResponse } from '@/app/api/booq/[library]/[id]/highlights/route'
import { AccountDisplayData, BooqRange, NoteData } from '@/core'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { v4 as uuidv4 } from 'uuid'

export function useBooqHighlights({
    booqId, self,
}: {
    booqId: string,
    self?: AccountDisplayData,
}) {
    const { data, isLoading } = useSWR(
        `/api/booq/${booqId}/highlights`,
        async (url: string) => {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!res.ok) {
                throw new Error('Failed to fetch highlights')
            }
            const result: GetResponse = await res.json()
            return result
        }
    )

    const { trigger: postHighlightTrigger } = useSWRMutation(
        `/api/booq/${booqId}/highlights`,
        async (url, { arg }: { arg: PostBody }) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(arg),
            })
            if (!res.ok) {
                throw new Error('Failed to add highlight')
            }
            const result: PostResponse = await res.json()
            return result
        }, {
        populateCache: (postResponse: PostResponse, currentData: GetResponse | undefined): GetResponse => {
            if (!currentData) {
                return {
                    highlights: [postResponse],
                }
            }
            return {
                highlights: [
                    ...currentData.highlights,
                    postResponse,
                ],
            }
        },
        rollbackOnError: true,
        revalidate: false,
    })
    function addHighlight({
        range: { start, end },
        color,
        note,
    }: {
        range: BooqRange,
        color: string,
        note?: string
    }) {
        if (!self) {
            return undefined
        }
        const postBody: PostBody = {
            id: uuidv4(),
            start, end, color,
            note: note ?? null,
        }
        postHighlightTrigger(postBody, {
            optimisticData: postBody,
        })
        const newHighlight: NoteData = {
            id: postBody.id,
            booqId,
            range: postBody,
            color: postBody.color,
            content: postBody.note ?? undefined,
            author: self,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        return newHighlight
    }

    const highlights: NoteData[] = data?.highlights.map(h => ({
        id: h.id,
        booqId: h.booqId,
        range: {
            start: h.start,
            end: h.end,
        },
        color: h.color,
        note: h.note,
        author: {
            id: h.author.id,
            name: h.author.name ?? undefined,
            profilePictureURL: h.author.profilePictureURL ?? undefined,
        },
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
    })) ?? []

    return {
        highlights,
        isLoading,
        addHighlight,
        removeHighlight: async (_id: string) => {
            // TODO: implement
        },
        updateHighlight: async (_id: string, _color: string, _note?: string) => {
            // TODO: implement
        },
    }
}