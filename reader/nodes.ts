import { groupBy } from 'lodash'
import { AccountDisplayData, BooqNote, pathInRange, TableOfContentsItem } from '@/core'

export type NavigationSelection = Record<string, boolean>
export type TocNode = {
    kind: 'toc',
    item: TableOfContentsItem,
}
export type HighlightNode = {
    kind: 'highlight',
    highlight: BooqNote,
}
export type PathHighlightsNode = {
    kind: 'highlights',
    items: Array<TableOfContentsItem | undefined>,
    highlights: BooqNote[],
}
export type NavigationNode = TocNode | HighlightNode | PathHighlightsNode

export function buildNavigationNodes({
    title, toc, selection, highlights, self,
}: {
    title: string
    toc: TableOfContentsItem[],
    highlights: BooqNote[],
    selection: NavigationSelection,
    self?: AccountDisplayData,
}) {
    const authors = highlightsAuthors(highlights)

    const showChapters = selection.chapters
    const showHighlights = selection.highlights
    const filteredHighlights = filterHighlights({
        highlights, selection, self,
    })

    const filter = showChapters
        ? (showHighlights ? 'all' : 'contents')
        : (showHighlights ? 'highlights' : 'none')
    const nodes = buildNodes({
        filter, title, toc,
        highlights: filteredHighlights,
    })

    return {
        nodes,
        authors,
    }
}

export function filterHighlights({
    highlights, selection, self,
}: {
    highlights: BooqNote[],
    selection: NavigationSelection,
    self: AccountDisplayData | undefined,
}) {
    const showHighlights = selection.highlights
    const showAuthors = Object.entries(selection)
        .filter(([key]) => key.startsWith('author:'))
        .map(([key]) => key.split(':')[1])
    const allAuthors = showHighlights && self?.id
        ? [self.id, ...showAuthors]
        : showAuthors
    const filteredHighlights = highlights.filter(
        h => allAuthors.some(authorId => h.author.id === authorId)
    )
    return filteredHighlights
}

function buildNodes({ toc, filter, highlights, title }: {
    title?: string,
    filter: string,
    toc: TableOfContentsItem[],
    highlights: BooqNote[],
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
        const inside = highlights.filter(
            hl => pathInRange(hl.range.start, {
                start: prev?.path ?? [0],
                end: next.path,
            }),
        )
        if (filter === 'all') {
            nodes.push(...inside.map(h => ({
                kind: 'highlight' as const,
                highlight: h,
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
        } else if (filter === 'highlights') {
            if (inside.length !== 0) {
                nodes.push({
                    kind: 'highlights',
                    items: prevPath,
                    highlights: inside,
                })
            }
        }
        prev = next
    }
    return nodes
}

function highlightsAuthors(highlights: BooqNote[]): AccountDisplayData[] {
    const grouped = groupBy(highlights, h => h.author.id)
    return Object.entries(grouped).map(
        ([_, [{ author }]]) => author
    )
}