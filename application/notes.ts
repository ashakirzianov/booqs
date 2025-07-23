'use client'

import type { GetResponse, PostBody, PostResponse } from '@/app/api/booq/[library]/[id]/notes/route'
import type { PatchBody, PatchResponse } from '@/app/api/notes/[id]/route'
import { AuthorData, BooqId, BooqRange, BooqNote, NotePrivacy } from '@/core'
import { nanoid } from 'nanoid'
import { useMemo } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

export const HIGHLIGHT_KINDS = [
    'highlight-0', 'highlight-1', 'highlight-2', 'highlight-3', 'highlight-4',
]
export const COMMENT_KIND = 'comment'
export function useBooqNotes({
    booqId, user,
}: {
    booqId: BooqId,
    user: AuthorData | undefined,
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
        kind,
        content,
        targetQuote,
        privacy = 'private', // Default to private if not specified
    }: {
        range: BooqRange,
        kind: string,
        content?: string,
        targetQuote: string,
        privacy?: NotePrivacy,
    }) {
        if (!user) return undefined

        const postBody: PostBody = {
            id: nanoid(10),
            kind,
            start_path: start,
            end_path: end,
            content: content ?? null,
            target_quote: targetQuote,
            privacy,
        }

        const now = new Date().toISOString()
        const optimisticResponse: PostResponse = {
            ...postBody,
            author_id: user.id,
            author_name: user.name,
            author_username: user.username,
            author_profile_picture_url: user.profilePictureURL ?? null,
            author_emoji: user.emoji,
            created_at: now,
            updated_at: now,
            booq_id: booqId,
            privacy,
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

    function updateNote({ noteId, kind, content }: {
        noteId: string,
        kind?: string,
        content?: string,
    }) {
        if (!user || !data) return undefined

        const body: PatchBody = {}
        if (kind !== undefined) body.kind = kind
        if (content !== undefined) body.content = content

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
function noteFromJson(note: NoteJson): BooqNote {
    return {
        id: note.id,
        booqId: note.booq_id as BooqId,
        range: {
            start: note.start_path,
            end: note.end_path,
        },
        kind: note.kind,
        content: note.content ?? undefined,
        targetQuote: note.target_quote,
        author: {
            id: note.author_id,
            username: note.author_username,
            name: note.author_name ?? undefined,
            profilePictureURL: note.author_profile_picture_url ?? undefined,
            emoji: note.author_emoji,
        },
        privacy: note.privacy,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    }
}
