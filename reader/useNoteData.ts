import { useMemo } from 'react'
import { BooqNote, BooqNode, textForRange, BooqId, AccountDisplayData } from '@/core'
import { useBooqNotes } from '@/application/notes'

export function useNoteData({
    booqId,
    nodes,
    user,
}: {
    booqId: BooqId,
    nodes: BooqNode[],
    user: AccountDisplayData | undefined,
}) {
    const { notes } = useBooqNotes({ booqId, user })
    const resolvedNotes = useMemo(() => {
        return notes.map<BooqNote>(note => ({
            ...note,
            start: note.range.start,
            end: note.range.end,
            text: textForRange(nodes, note.range) ?? '',
        }))
    }, [notes, nodes])

    return { notes: resolvedNotes }
}