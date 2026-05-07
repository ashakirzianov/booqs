'use server'
import { BooqId, BooqLocator } from '@/core'
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
    locator: BooqLocator,
    kind: string,
    color?: string,
    content?: string,
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
    userId,
    booqId,
    locator,
    kind,
    color,
    content,
    privacy = 'private',
}: {
    id: string,
    userId: string,
    booqId: BooqId,
    locator: BooqLocator,
    kind: string,
    color?: string,
    content?: string,
    privacy?: AnnotationPrivacy,
}): Promise<UnresolvedBooqAnnotation | undefined> {
    try {
        const dbAnnotation = await addAnnotation({
            id,
            userId,
            booqId,
            range: { start: locator.start, end: locator.end ?? locator.start },
            prefix: locator.prefix,
            text: locator.text ?? '',
            suffix: locator.suffix,
            kind,
            color,
            content,
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
    userId,
}: {
    id: string,
    userId: string,
}): Promise<boolean> {
    return removeAnnotation({ id, userId })
}

export async function modifyAnnotation({
    id,
    userId,
    kind,
    color,
    content,
}: {
    id: string,
    userId: string,
    kind?: string,
    color?: string | null,
    content?: string | null,
}): Promise<UnresolvedBooqAnnotation | undefined> {
    const result = await updateAnnotation({ id, userId, kind, color, content })
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
        authorId: annotation.user_id,
        locator: {
            start: annotation.start_path,
            end: annotation.end_path,
            prefix: annotation.prefix,
            text: annotation.text,
            suffix: annotation.suffix,
        },
        kind: annotation.kind,
        color: annotation.color ?? undefined,
        content: annotation.content ?? undefined,
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
            id: dbAnnotation.user_id,
            name: dbAnnotation.author_name,
            username: dbAnnotation.author_username,
            profilePictureURL: dbAnnotation.author_profile_picture_url ?? undefined,
            emoji: dbAnnotation.author_emoji,
        },
        locator: {
            start: dbAnnotation.start_path,
            end: dbAnnotation.end_path,
            prefix: dbAnnotation.prefix,
            text: dbAnnotation.text,
            suffix: dbAnnotation.suffix,
        },
        kind: dbAnnotation.kind,
        color: dbAnnotation.color ?? undefined,
        content: dbAnnotation.content ?? undefined,
        privacy: dbAnnotation.privacy,
        createdAt: dbAnnotation.created_at,
        updatedAt: dbAnnotation.updated_at,
    }
}
