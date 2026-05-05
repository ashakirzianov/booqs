import { pathInRange, TableOfContentsItem } from '@/core'
import { NavigationSelection } from './useNavigationState'
import { AnnotationAuthorData, BooqAnnotation } from '@/data/annotations'

export type TocNode = {
    kind: 'toc',
    item: TableOfContentsItem,
}
export type NoteNode = {
    kind: 'note',
    annotation: BooqAnnotation,
}
export type PathNotesNode = {
    kind: 'annotations',
    items: Array<TableOfContentsItem | undefined>,
    annotations: BooqAnnotation[],
}
export type NavigationNode = TocNode | NoteNode | PathNotesNode

export function buildNavigationNodes({
    title, toc, selection, annotations, user,
}: {
    title: string
    toc: TableOfContentsItem[],
    annotations: BooqAnnotation[],
    selection: NavigationSelection,
    user?: AnnotationAuthorData,
}) {
    const showChapters = selection.chapters
    const showNotes = selection.annotations
    const filteredNotes = filterNotes({
        annotations, selection, user,
    })

    const filter = showChapters
        ? (showNotes ? 'all' : 'contents')
        : (showNotes ? 'annotations' : 'none')
    const nodes = buildNodes({
        filter, title, toc,
        annotations: filteredNotes,
    })

    return nodes
}

export function filterNotes({
    annotations, selection, user,
}: {
    annotations: BooqAnnotation[],
    selection: NavigationSelection,
    user: AnnotationAuthorData | undefined,
}) {
    const showNotes = selection.annotations
    const showAuthors = Object.entries(selection)
        .filter(([key]) => key.startsWith('author:'))
        .map(([key]) => key.split(':')[1])
    const allAuthors = showNotes && user?.id
        ? [user.id, ...showAuthors]
        : showAuthors
    const filteredNotes = annotations.filter(
        note => allAuthors.some(authorId => note.author.id === authorId)
    )
    return filteredNotes
}

function buildNodes({ toc, filter, annotations, title }: {
    title?: string,
    filter: string,
    toc: TableOfContentsItem[],
    annotations: BooqAnnotation[],
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
        const inside = annotations.filter(
            note => pathInRange(note.range.start, {
                start: prev?.path ?? [0],
                end: next.path,
            }),
        )
        if (filter === 'all') {
            nodes.push(...inside.map(annotation => ({
                kind: 'note' as const,
                annotation,
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
        } else if (filter === 'annotations') {
            if (inside.length !== 0) {
                nodes.push({
                    kind: 'annotations',
                    items: prevPath,
                    annotations: inside,
                })
            }
        }
        prev = next
    }
    return nodes
}