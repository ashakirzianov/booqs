import { useMemo } from 'react'
import { BooqId, BooqRange, pathInRange, pathLessThan } from '@/core'
import { COMMENT_KIND, QUESTION_KIND, useBooqAnnotations } from '@/application/annotations'
import { BooqAnnotation, AnnotationAuthorData } from '@/data/annotations'

export function useAnnotationsData({
    booqId,
    user,
    currentRange,
    highlightsAuthorIds,
    initialAnnotations,
}: {
    booqId: BooqId,
    user: AnnotationAuthorData | undefined,
    currentRange?: BooqRange,
    highlightsAuthorIds: Set<string>,
    initialAnnotations: BooqAnnotation[],
}) {
    const { annotations: allAnnotations, isLoading } = useBooqAnnotations({ booqId, user, initialAnnotations })

    const sortedAnnotations = useMemo(() => {
        return allAnnotations
            .sort((a, b) => {
                if (pathLessThan(a.range.start, b.range.start)) return -1
                if (pathLessThan(b.range.start, a.range.start)) return 1
                return 0
            })
    }, [allAnnotations])

    const allHighlights = useMemo(() => {
        return sortedAnnotations.filter(a => a.kind === 'highlight')
    }, [sortedAnnotations])

    const allHighlightsAuthors = useMemo(() => {
        const set = new Set<string>()
        const authors: AnnotationAuthorData[] = []
        for (const a of allHighlights) {
            if (!set.has(a.author.id)) {
                set.add(a.author.id)
                authors.push(a.author)
            }
        }
        return authors
    }, [allHighlights])

    const filteredHighlights = useMemo(() => {
        return allHighlights
            .filter(a => highlightsAuthorIds.has(a.author.id))
    }, [allHighlights, highlightsAuthorIds])

    const comments = useMemo(() => {
        if (!currentRange) return []
        return sortedAnnotations.filter(a =>
            (a.kind === COMMENT_KIND || a.kind === QUESTION_KIND)
            && pathInRange(a.range.start, currentRange)
            && a.content
            && a.content.trim()?.length > 0
        )
    }, [sortedAnnotations, currentRange])

    return {
        filteredHighlights,
        comments,
        allHighlightsAuthors,
        annotationsAreLoading: isLoading
    }
}
