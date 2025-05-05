'use client'

import type { GetResponse, PostBody, PostResponse } from '@/app/api/booq/[library]/[id]/notes/route'
import { AccountDisplayData, BooqRange, NoteData } from '@/core'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { v4 as uuidv4 } from 'uuid'

export function useBooqNotes({
    booqId, self,
}: {
    booqId: string,
    self?: AccountDisplayData,
}) {
    const { data, isLoading } = useSWR(
        `/api/booq/${booqId}/notes`,
        async (url: string) => {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!res.ok) {
                throw new Error('Failed to fetch notes')
            }
            const result: GetResponse = await res.json()
            return result
        }
    )

    const { trigger: postNoteTrigger } = useSWRMutation(
        `/api/booq/${booqId}/notes`,
        async (url, { arg }: { arg: PostBody }) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(arg),
            })
            if (!res.ok) {
                throw new Error('Failed to add note')
            }
            const result: PostResponse = await res.json()
            return result
        }, {
        populateCache: (postResponse: PostResponse, currentData: GetResponse | undefined): GetResponse => {
            if (!currentData) {
                return {
                    notes: [postResponse],
                }
            }
            return {
                notes: [
                    ...currentData.notes,
                    postResponse,
                ],
            }
        },
        rollbackOnError: true,
        revalidate: false,
    })
    function addNote({
        range: { start, end },
        color,
        content,
    }: {
        range: BooqRange,
        color: string,
        content?: string
    }) {
        if (!self) {
            return undefined
        }
        const postBody: PostBody = {
            id: uuidv4(),
            start, end, color,
            content: content ?? null,
        }
        postNoteTrigger(postBody, {
            optimisticData: postBody,
        })
        const newNote: NoteData = {
            id: postBody.id,
            booqId,
            range: postBody,
            color: postBody.color,
            content: postBody.content ?? undefined,
            author: self,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        return newNote
    }

    const notes: NoteData[] = data?.notes.map(note => ({
        id: note.id,
        booqId: note.booqId,
        range: {
            start: note.start,
            end: note.end,
        },
        color: note.color,
        content: note.content ?? undefined,
        author: {
            id: note.author.id,
            name: note.author.name ?? undefined,
            profilePictureURL: note.author.profilePictureURL ?? undefined,
        },
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
    })) ?? []

    return {
        notes,
        isLoading,
        addNote,
        removeNote: async (_id: string) => {
            // TODO: implement
        },
        updateNote: async (_id: string, _color: string, _note?: string) => {
            // TODO: implement
        },
    }
}