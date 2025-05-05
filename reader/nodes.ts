import { groupBy } from 'lodash'
import { pathInRange } from '@/core'
import { NavigationSelection, ReaderHighlight, ReaderTocItem, ReaderUser } from './common'

export type TocNode = {
    kind: 'toc',
    item: ReaderTocItem,
}
export type HighlightNode = {
    kind: 'highlight',
    highlight: ReaderHighlight,
}
export type PathHighlightsNode = {
    kind: 'highlights',
    items: Array<ReaderTocItem | undefined>,
    highlights: ReaderHighlight[],
}
export type NavigationNode = TocNode | HighlightNode | PathHighlightsNode

export function buildNavigationNodes({
    title, toc, selection, highlights, self,
}: {
    title: string
    toc: ReaderTocItem[],
    highlights: ReaderHighlight[],
    selection: NavigationSelection,
    self?: ReaderUser,
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
    highlights: ReaderHighlight[],
    selection: NavigationSelection,
    self: ReaderUser | undefined,
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
    toc: ReaderTocItem[],
    highlights: ReaderHighlight[],
}): NavigationNode[] {
    const nodes: NavigationNode[] = []
    let prev: ReaderTocItem = {
        title: title ?? 'Untitled',
        position: 0,
        level: 0,
        path: [0],
    }
    let prevPath: Array<ReaderTocItem | undefined> = []
    for (const next of toc) {
        prevPath = prevPath.slice(0, prev.level)
        prevPath[prev.level] = prev
        const inside = highlights.filter(
            hl => pathInRange(hl.start, {
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

function highlightsAuthors(highlights: ReaderHighlight[]): ReaderUser[] {
    const grouped = groupBy(highlights, h => h.author.id)
    return Object.entries(grouped).map(
        ([_, [{ author }]]) => ({
            id: author.id,
            name: author.name,
            pictureUrl: author.pictureUrl,
        })
    )
}