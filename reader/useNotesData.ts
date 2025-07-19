import { useMemo } from 'react'
import { BooqId, AuthorData, BooqRange, pathInRange, pathLessThan } from '@/core'
import { useBooqNotes } from '@/application/notes'

export function useNotesData({
    booqId,
    user,
    currentRange,
}: {
    booqId: BooqId,
    user: AuthorData | undefined,
    currentRange?: BooqRange,
}) {
    const { notes: allNotes } = useBooqNotes({ booqId, user })

    const sortedNotes = useMemo(() => {
        return allNotes
            .sort((a, b) => {
                // Sort by start path
                if (pathLessThan(a.range.start, b.range.start)) return -1
                if (pathLessThan(b.range.start, a.range.start)) return 1
                return 0
            })
    }, [allNotes])

    const userNotes = useMemo(() => {
        return sortedNotes.filter(note => note.author.id === user?.id)
    }, [sortedNotes, user?.id])

    const comments = useMemo(() => {
        if (!currentRange) return []
        return sortedNotes.filter(note =>
            pathInRange(note.range.start, currentRange)
            && note.content
            && note.content.trim()?.length > 0
        )
    }, [sortedNotes, currentRange])

    return { userNotes, comments }
}