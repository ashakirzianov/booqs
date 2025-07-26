import { useMemo } from 'react'
import { BooqId, BooqRange, pathInRange, pathLessThan } from '@/core'
import { HIGHLIGHT_KINDS, COMMENT_KIND, useBooqNotes } from '@/application/notes'
import { AuthorData } from '@/data/user'

export function useNotesData({
    booqId,
    user,
    currentRange,
    highlightsAuthorIds,
}: {
    booqId: BooqId,
    user: AuthorData | undefined,
    currentRange?: BooqRange,
    highlightsAuthorIds: Set<string>,
}) {
    const { notes: allNotes, isLoading } = useBooqNotes({ booqId, user })

    const sortedNotes = useMemo(() => {
        return allNotes
            .sort((a, b) => {
                // Sort by start path
                if (pathLessThan(a.range.start, b.range.start)) return -1
                if (pathLessThan(b.range.start, a.range.start)) return 1
                return 0
            })
    }, [allNotes])

    const allHighlights = useMemo(() => {
        return sortedNotes.filter(note => HIGHLIGHT_KINDS.includes(note.kind))
    }, [sortedNotes])

    const allHighlightsAuthors = useMemo(() => {
        const set = new Set<string>()
        const authors: AuthorData[] = []
        for (const note of allHighlights) {
            if (!set.has(note.author.id)) {
                set.add(note.author.id)
                authors.push(note.author)
            }
        }
        return authors
    }, [allHighlights])

    const filteredHighlights = useMemo(() => {
        return allHighlights
            .filter(note => highlightsAuthorIds.has(note.author.id))
    }, [allHighlights, highlightsAuthorIds])

    const comments = useMemo(() => {
        if (!currentRange) return []
        return sortedNotes.filter(note =>
            note.kind === COMMENT_KIND
            && pathInRange(note.range.start, currentRange)
            && note.content
            && note.content.trim()?.length > 0
        )
    }, [sortedNotes, currentRange])

    return {
        filteredHighlights,
        comments,
        allHighlightsAuthors,
        notesAreLoading: isLoading
    }
}