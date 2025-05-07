'use client'

import type { GetResponse, PostBody, PostResponse } from '@/app/api/booq/[library]/[id]/notes/route'
import type { PatchBody, PatchResponse } from '@/app/api/notes/[id]/route'
import { AccountDisplayData, BooqRange, NoteData } from '@/core'
import { useMemo } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { v4 } from 'uuid'

export function useBooqNotes({
    booqId, user,
}: {
    booqId: string,
    user: AccountDisplayData | undefined,
}) {
    const notesKey = `/api/booq/${booqId}/notes`

    const { data, isLoading } = useSWR(
        notesKey,
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

    const notes = useMemo(() =>
        data?.notes.map(noteFromJson) ?? [],
        [data?.notes]
    )

    const { trigger: postNoteTrigger } = useSWRMutation(
        notesKey,
        async (url, { arg: body }: { arg: PostBody }) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error('Failed to add note')
            }
            const result: PostResponse = await res.json()
            return result
        },
        {
            populateCache: (postResponse: PostResponse, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { notes: [postResponse] }
                }
                return {
                    notes: [...currentData.notes, postResponse],
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function addNote({
        range: { start, end },
        color,
        content,
    }: {
        range: BooqRange,
        color: string,
        content?: string
    }) {
        if (!user) return undefined

        const postBody: PostBody = {
            id: v4(),
            color,
            start_path: start,
            end_path: end,
            content: content ?? null,
        }

        const now = new Date().toISOString()
        const optimisticResponse: PostResponse = {
            ...postBody,
            author_id: user.id,
            author_name: user.name ?? null,
            author_profile_picture_url: user.profilePictureURL ?? null,
            created_at: now,
            updated_at: now,
            booq_id: booqId,
        }

        postNoteTrigger(postBody, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse =>
                currentData
                    ? { notes: [...currentData.notes, optimisticResponse] }
                    : { notes: [optimisticResponse] },
        })

        return noteFromJson(optimisticResponse)
    }

    const { trigger: deleteNoteTrigger } = useSWRMutation(
        notesKey,
        async (_key: string, { arg: noteId }: { arg: string }) => {
            const res = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                throw new Error('Failed to delete note')
            }
            return noteId
        },
        {
            populateCache: (deleteResponse: string, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { notes: [] }
                }
                return {
                    notes: currentData.notes.filter(n => n.id !== deleteResponse),
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function removeNote({ noteId }: { noteId: string }) {
        if (!user || !data) return false
        deleteNoteTrigger(noteId, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse =>
                currentData
                    ? { notes: currentData.notes.filter(n => n.id !== noteId) }
                    : { notes: [] },
        })
        return true
    }

    const { trigger: updateNoteTrigger } = useSWRMutation(
        notesKey,
        async (_key: string, { arg: { noteId, body } }: {
            arg: {
                noteId: string,
                body: PatchBody,
            }
        }) => {
            const res = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error('Failed to update note')
            }
            const result: PatchResponse = await res.json()
            return result
        },
        {
            populateCache: (patchResponse: PatchResponse, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { notes: [] }
                }
                return {
                    notes: currentData.notes.map(n =>
                        n.id === patchResponse.id
                            ? { ...n, ...patchResponse }
                            : n
                    ),
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function updateNote({ noteId, color, content }: {
        noteId: string,
        color?: string,
        content?: string,
    }) {
        if (!user || !data) return

        const body: PatchBody = {
            color,
            content,
        }

        updateNoteTrigger({ noteId, body }, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse => {
                if (!currentData) {
                    return { notes: [] }
                }
                const now = new Date().toISOString()
                return {
                    notes: currentData.notes.map(n =>
                        n.id === noteId
                            ? { ...n, ...body, updated_at: now }
                            : n
                    ),
                }
            },
        })
    }

    return {
        notes,
        isLoading,
        addNote,
        removeNote,
        updateNote,
    }
}

type NoteJson = GetResponse['notes'][number]
function noteFromJson(note: NoteJson): NoteData {
    return {
        id: note.id,
        booqId: note.booq_id,
        range: {
            start: note.start_path,
            end: note.end_path,
        },
        color: note.color,
        content: note.content ?? undefined,
        author: {
            id: note.author_id,
            name: note.author_name ?? undefined,
            profilePictureURL: note.author_profile_picture_url ?? undefined,
        },
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    }
}
