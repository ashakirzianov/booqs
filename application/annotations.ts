'use client'

import type { GetResponse } from '@/app/api/annotations/route'
import type { PostBody, PostResponse, PatchBody, PatchResponse } from '@/app/api/annotations/[id]/route'
import { BooqId, BooqLocator, BooqRange } from '@/core'
import { AnnotationAuthorData, BooqAnnotation, AnnotationPrivacy } from '@/data/annotations'
import { nanoid } from 'nanoid'
import { useMemo } from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

export const HIGHLIGHT_COLORS = ['yellow', 'blue', 'pink', 'purple', 'green'] as const
export type HighlightColor = typeof HIGHLIGHT_COLORS[number]
export const COMMENT_KIND = 'comment'
export const QUESTION_KIND = 'question'

export type AnnotationAugmentation = {
    id: string,
    range: BooqRange,
    color?: string,
    underline?: 'solid' | 'dashed',
}

export function augmentationForAnnotation(annotation: BooqAnnotation): AnnotationAugmentation {
    const isCommentOrQuestion = annotation.kind === COMMENT_KIND || annotation.kind === QUESTION_KIND
    const { locator } = annotation
    return {
        id: `annotation/${annotation.id}`,
        range: { start: locator.start, end: locator.end ?? locator.start },
        color: isCommentOrQuestion ? undefined : `var(--color-highlight-${annotation.color ?? 'yellow'})`,
        underline: isCommentOrQuestion ? 'dashed' : undefined,
    }
}

export function useBooqAnnotations({
    booqId, user, initialAnnotations,
}: {
    booqId: BooqId,
    user: AnnotationAuthorData | undefined,
    initialAnnotations?: BooqAnnotation[],
}) {
    const annotationsKey = `/api/annotations?booq_id=${booqId}`

    const { data, isLoading } = useSWR(
        annotationsKey,
        async (url: string) => {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!res.ok) {
                throw new Error('Failed to fetch annotations')
            }
            const result: GetResponse = await res.json()
            return result
        }
    )

    const annotations = useMemo(
        () => (data?.annotations) ?? initialAnnotations ?? [],
        [data?.annotations, initialAnnotations]
    )

    const { trigger: postAnnotationTrigger } = useSWRMutation(
        annotationsKey,
        async (_url, { arg: { body, annotationId } }: {
            arg: {
                body: PostBody,
                annotationId: string,
            }
        }) => {
            const res = await fetch(`/api/annotations/${annotationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error('Failed to add annotation')
            }
            const result: PostResponse = await res.json()
            return result
        },
        {
            populateCache: (postResponse: PostResponse, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { annotations: [postResponse] }
                }
                return {
                    annotations: [...currentData.annotations, postResponse],
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function addAnnotation({
        locator,
        kind,
        color,
        content,
        privacy = 'private',
        id,
    }: {
        locator: BooqLocator,
        kind: string,
        color?: string,
        content?: string,
        privacy?: AnnotationPrivacy,
        id?: string,
    }) {
        if (!user) return undefined

        const annotationId = id ?? nanoid(10)
        const postBody: PostBody = {
            booqId,
            locator,
            kind,
            color,
            content,
            privacy,
        }

        const now = new Date().toISOString()
        const optimisticResponse: PostResponse = {
            id: annotationId,
            booqId,
            author: user,
            locator,
            kind,
            color,
            content,
            privacy,
            createdAt: now,
            updatedAt: now,
        }

        const posted = postAnnotationTrigger({
            body: postBody,
            annotationId,
        }, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse =>
                currentData
                    ? { annotations: [...currentData.annotations, optimisticResponse] }
                    : { annotations: [optimisticResponse] },
        })

        return { optimistic: optimisticResponse, posted }
    }

    const { trigger: deleteAnnotationTrigger } = useSWRMutation(
        annotationsKey,
        async (_key: string, { arg: annotationId }: { arg: string }) => {
            const res = await fetch(`/api/annotations/${annotationId}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                throw new Error('Failed to delete annotation')
            }
            return annotationId
        },
        {
            populateCache: (deleteResponse: string, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { annotations: [] }
                }
                return {
                    annotations: currentData.annotations.filter(n => n.id !== deleteResponse),
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function removeAnnotation({ annotationId }: { annotationId: string }) {
        if (!user || !data) return undefined

        const posted = deleteAnnotationTrigger(annotationId, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse =>
                currentData
                    ? { annotations: currentData.annotations.filter(n => n.id !== annotationId) }
                    : { annotations: [] },
        })

        return { optimistic: { annotationId }, posted }
    }

    const { trigger: updateAnnotationTrigger } = useSWRMutation(
        annotationsKey,
        async (_key: string, { arg: { annotationId, body } }: {
            arg: {
                annotationId: string,
                body: PatchBody,
            }
        }) => {
            const res = await fetch(`/api/annotations/${annotationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error('Failed to update annotation')
            }
            const result: PatchResponse = await res.json()
            return result
        },
        {
            populateCache: (patchResponse: PatchResponse, currentData: GetResponse | undefined) => {
                if (!currentData) {
                    return { annotations: [] }
                }
                return {
                    annotations: currentData.annotations.map(n =>
                        n.id === patchResponse.id
                            ? { ...n, ...patchResponse, content: patchResponse.content }
                            : n
                    ),
                }
            },
            rollbackOnError: true,
            revalidate: false,
        }
    )

    function updateAnnotation({ annotationId, kind, color, content }: {
        annotationId: string,
        kind?: string,
        color?: string | null,
        content?: string | null,
    }) {
        if (!user || !data) return undefined

        const body: PatchBody = {}
        if (kind !== undefined) body.kind = kind
        if (color !== undefined) body.color = color
        if (content !== undefined) body.content = content

        const posted = updateAnnotationTrigger({ annotationId, body }, {
            optimisticData: (currentData: GetResponse | undefined): GetResponse => {
                if (!currentData) {
                    return { annotations: [] }
                }
                const now = new Date().toISOString()
                return {
                    annotations: currentData.annotations.map(n =>
                        n.id === annotationId
                            ? { ...n, ...body, color: body.color ?? undefined, content: body.content ?? undefined, updatedAt: now }
                            : n
                    ),
                }
            },
        })

        return { optimistic: { annotationId, ...body }, posted }
    }

    return {
        annotations,
        isLoading,
        addAnnotation,
        removeAnnotation,
        updateAnnotation,
    }
}
