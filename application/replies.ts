'use client'

import type { GetResponse } from '@/app/api/replies/route'
import type { PostBody, PostResponse, PatchBody, PatchResponse } from '@/app/api/replies/[id]/route'
import { NoteAuthorData } from '@/data/notes'
import { nanoid } from 'nanoid'
import { useMemo } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

export function useNoteReplies({
    noteId, user,
}: {
    noteId: string,
    user: NoteAuthorData | undefined,
}) {
    const repliesKey = `/api/replies?note_id=${noteId}`

    const { data, isLoading } = useSWR(
        repliesKey,
        async (url: string) => {
            const res = await fetch(url)
            if (!res.ok) {
                throw new Error('Failed to fetch replies')
            }
            const result: GetResponse = await res.json()
            return result
        }
    )

    const replies = useMemo(
        () => data?.replies ?? [],
        [data?.replies]
    )

    const { trigger: postReplyTrigger } = useSWRMutation(
        repliesKey,
        async (_url, { arg: { body, replyId } }: {
            arg: {
                body: PostBody,
                replyId: string,
            }
        }) => {
            const res = await fetch(`/api/replies/${replyId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error('Failed to add reply')
            }
            const result: PostResponse = await res.json()
            return result
        },
        {
            populateCache: (postResponse: PostResponse, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { replies: [postResponse] }
                }
                return {
                    replies: [...currentData.replies, postResponse],
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function addReply({ content }: { content: string }) {
        if (!user) return undefined

        const replyId = nanoid(10)
        const body: PostBody = { noteId, content }
        const now = new Date().toISOString()
        const optimisticResponse: PostResponse = {
            id: replyId,
            noteId,
            author: user,
            content,
            createdAt: now,
            updatedAt: now,
        }

        postReplyTrigger({ body, replyId }, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse =>
                currentData
                    ? { replies: [...currentData.replies, optimisticResponse] }
                    : { replies: [optimisticResponse] },
        })

        return optimisticResponse
    }

    const { trigger: deleteReplyTrigger } = useSWRMutation(
        repliesKey,
        async (_key: string, { arg: replyId }: { arg: string }) => {
            const res = await fetch(`/api/replies/${replyId}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                throw new Error('Failed to delete reply')
            }
            return replyId
        },
        {
            populateCache: (deleteResponse: string, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { replies: [] }
                }
                return {
                    replies: currentData.replies.filter(r => r.id !== deleteResponse),
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function removeReply({ replyId }: { replyId: string }) {
        if (!user || !data) return false
        deleteReplyTrigger(replyId, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse =>
                currentData
                    ? { replies: currentData.replies.filter(r => r.id !== replyId) }
                    : { replies: [] },
        })
        return true
    }

    const { trigger: updateReplyTrigger } = useSWRMutation(
        repliesKey,
        async (_key: string, { arg: { replyId, body } }: {
            arg: {
                replyId: string,
                body: PatchBody,
            }
        }) => {
            const res = await fetch(`/api/replies/${replyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error('Failed to update reply')
            }
            const result: PatchResponse = await res.json()
            return result
        },
        {
            populateCache: (patchResponse: PatchResponse, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { replies: [] }
                }
                return {
                    replies: currentData.replies.map(r =>
                        r.id === patchResponse.id
                            ? { ...r, ...patchResponse }
                            : r
                    ),
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function updateReply({ replyId, content }: {
        replyId: string,
        content: string,
    }) {
        if (!user || !data) return undefined
        const body: PatchBody = { content }
        updateReplyTrigger({ replyId, body }, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse => {
                if (!currentData) {
                    return { replies: [] }
                }
                const now = new Date().toISOString()
                return {
                    replies: currentData.replies.map(r =>
                        r.id === replyId
                            ? { ...r, content, updatedAt: now }
                            : r
                    ),
                }
            },
        })
    }

    return {
        replies,
        isLoading,
        addReply,
        removeReply,
        updateReply,
    }
}
