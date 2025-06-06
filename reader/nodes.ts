import groupBy from 'lodash-es/groupBy'
import { AccountDisplayData, BooqNote, pathInRange, TableOfContentsItem } from '@/core'

export type NavigationSelection = Record<string, boolean>
export type TocNode = {
    kind: 'toc',
    item: TableOfContentsItem,
}
export type NoteNode = {
    kind: 'note',
    note: BooqNote,
}
export type PathNotesNode = {
    kind: 'notes',
    items: Array<TableOfContentsItem | undefined>,
    notes: BooqNote[],
}
export type NavigationNode = TocNode | NoteNode | PathNotesNode

export function buildNavigationNodes({
    title, toc, selection, notes, user,
}: {
    title: string
    toc: TableOfContentsItem[],
    notes: BooqNote[],
    selection: NavigationSelection,
    user?: AccountDisplayData,
}) {
    const authors = notesAuthors(notes)

    const showChapters = selection.chapters
    const showNotes = selection.notes
    const filteredNotes = filterNotes({
        notes, selection, user,
    })

    const filter = showChapters
        ? (showNotes ? 'all' : 'contents')
        : (showNotes ? 'notes' : 'none')
    const nodes = buildNodes({
        filter, title, toc,
        notes: filteredNotes,
    })

    return {
        nodes,
        authors,
    }
}

export function filterNotes({
    notes, selection, user,
}: {
    notes: BooqNote[],
    selection: NavigationSelection,
    user: AccountDisplayData | undefined,
}) {
    const showNotes = selection.notes
    const showAuthors = Object.entries(selection)
        .filter(([key]) => key.startsWith('author:'))
        .map(([key]) => key.split(':')[1])
    const allAuthors = showNotes && user?.id
        ? [user.id, ...showAuthors]
        : showAuthors
    const filteredNotes = notes.filter(
        note => allAuthors.some(authorId => note.author.id === authorId)
    )
    return filteredNotes
}

function buildNodes({ toc, filter, notes, title }: {
    title?: string,
    filter: string,
    toc: TableOfContentsItem[],
    notes: BooqNote[],
}): NavigationNode[] {
    const nodes: NavigationNode[] = []
    let prev: TableOfContentsItem = {
        title: title ?? 'Untitled',
        position: 0,
        level: 0,
        path: [0],
    }
    let prevPath: Array<TableOfContentsItem | undefined> = []
    for (const next of toc) {
        prevPath = prevPath.slice(0, prev.level)
        prevPath[prev.level] = prev
        const inside = notes.filter(
            hl => pathInRange(hl.range.start, {
                start: prev?.path ?? [0],
                end: next.path,
            }),
        )
        if (filter === 'all') {
            nodes.push(...inside.map(note => ({
                kind: 'note' as const,
                note,
            })))
            nodes.push({
                kind: 'toc',
                item: next,
            })
        } else if (filter === 'contents') {
            nodes.push({
                kind: 'toc',
                item: next,
            })
        } else if (filter === 'notes') {
            if (inside.length !== 0) {
                nodes.push({
                    kind: 'notes',
                    items: prevPath,
                    notes: inside,
                })
            }
        }
        prev = next
    }
    return nodes
}

function notesAuthors(notes: BooqNote[]): AccountDisplayData[] {
    const grouped = groupBy(notes, n => n.author.id)
    return Object.entries(grouped).map(
        ([_, [{ author }]]) => author
    )
}