'use server'
import { BooqId, BooqRange } from '@/core'
import {
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    annotationsWithAuthorFor,
    getBooqsWithOwnAnnotations,
    DbAnnotation,
    DbAnnotationWithAuthor,
} from '@/backend/annotations'
import { getUserIdInsideRequest } from './request'

export type AnnotationPrivacy = 'private' | 'public'

export type AnnotationAuthorData = {
    id: string,
    username: string,
    name: string,
    emoji: string,
    profilePictureURL?: string,
}

export type BooqAnnotation = {
    id: string,
    booqId: BooqId,
    author: AnnotationAuthorData,
    range: BooqRange,
    kind: string,
    content?: string,
    targetQuote: string,
    privacy: AnnotationPrivacy,
    createdAt: string,
    updatedAt: string,
}

export type UnresolvedBooqAnnotation = Omit<BooqAnnotation, 'author'> & {
    authorId: string,
}

export async function fetchAnnotations({ booqId, authorId }: {
    booqId?: BooqId,
    authorId?: string,
}): Promise<BooqAnnotation[]> {
    const userId = await getUserIdInsideRequest()
    const dbAnnotations = await annotationsWithAuthorFor({ booqId, authorId, userId })
    return dbAnnotations.map(annotationFromDbAnnotationWithAuthor)
}

export async function createAnnotation({
    id,
    authorId,
    booqId,
    range,
    kind,
    content,
    targetQuote,
    privacy = 'private',
}: {
    id: string,
    authorId: string,
    booqId: BooqId,
    range: BooqRange,
    kind: string,
    content?: string,
    targetQuote: string,
    privacy?: AnnotationPrivacy,
}): Promise<UnresolvedBooqAnnotation | undefined> {
    try {
        const dbAnnotation = await addAnnotation({
            id,
            authorId,
            booqId,
            range,
            kind,
            content,
            targetQuote,
            privacy,
        })
        return unresolvedBooqAnnotation(dbAnnotation)
    } catch (error) {
        console.error('Error creating annotation:', error)
        return undefined
    }

}

export async function deleteAnnotation({
    id,
    authorId,
}: {
    id: string,
    authorId: string,
}): Promise<boolean> {
    return removeAnnotation({ id, authorId })
}

export async function modifyAnnotation({
    id,
    authorId,
    kind,
    content,
}: {
    id: string,
    authorId: string,
    kind?: string,
    content?: string | null,
}): Promise<UnresolvedBooqAnnotation | undefined> {
    const result = await updateAnnotation({ id, authorId, kind, content })
    if (result === null) {
        return undefined
    }
    return unresolvedBooqAnnotation(result)
}

export async function fetchBooqsWithOwnAnnotations(): Promise<BooqId[]> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return []
    }
    const booqIds = await getBooqsWithOwnAnnotations(userId)
    return booqIds as BooqId[]
}

function unresolvedBooqAnnotation(annotation: DbAnnotation): UnresolvedBooqAnnotation {
    return {
        id: annotation.id,
        booqId: annotation.booq_id as BooqId,
        authorId: annotation.author_id,
        range: {
            start: annotation.start_path,
            end: annotation.end_path,
        },
        kind: annotation.kind,
        content: annotation.content ?? undefined,
        targetQuote: annotation.target_quote,
        privacy: annotation.privacy,
        createdAt: annotation.created_at,
        updatedAt: annotation.updated_at,
    }
}

function annotationFromDbAnnotationWithAuthor(dbAnnotation: DbAnnotationWithAuthor): BooqAnnotation {
    return {
        id: dbAnnotation.id,
        booqId: dbAnnotation.booq_id as BooqId,
        author: {
            id: dbAnnotation.author_id,
            name: dbAnnotation.author_name,
            username: dbAnnotation.author_username,
            profilePictureURL: dbAnnotation.author_profile_picture_url ?? undefined,
            emoji: dbAnnotation.author_emoji,
        },
        range: {
            start: dbAnnotation.start_path,
            end: dbAnnotation.end_path,
        },
        kind: dbAnnotation.kind,
        content: dbAnnotation.content ?? undefined,
        targetQuote: dbAnnotation.target_quote,
        privacy: dbAnnotation.privacy,
        createdAt: dbAnnotation.created_at,
        updatedAt: dbAnnotation.updated_at,
    }
}
