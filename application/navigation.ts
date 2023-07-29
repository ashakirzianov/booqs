import { groupBy } from 'lodash'
import { pathInRange } from '@/core'
import { User } from './auth'
import { useMemo } from 'react'
import { useAppState, useAppStateSetter } from './state'
import { TocItem, useToc } from './toc'
import { Highlight, useHighlights } from './highlights'

export type TocNode = {
    kind: 'toc',
    item: TocItem,
}
export type HighlightNode = {
    kind: 'highlight',
    highlight: Highlight,
};
export type PathHighlightsNode = {
    kind: 'highlights',
    items: Array<TocItem | undefined>,
    highlights: Highlight[],
}
export type NavigationNode = TocNode | HighlightNode | PathHighlightsNode;

export function useNavigationNodes(booqId: string, self?: User) {
    const { showChapters, showHighlights, showAuthors } = useAppState().navigationState
    const { toc, title } = useToc(booqId)
    const { highlights } = useHighlights(booqId)
    const authors = highlightsAuthors(highlights)

    const allAuthors = showHighlights && self?.id
        ? [self.id, ...showAuthors]
        : showAuthors
    const filteredHighlights = highlights.filter(
        h => allAuthors.some(authorId => h.author.id === authorId)
    )

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

export function useFilteredHighlights(booqId: string, self: User | undefined) {
    const { showHighlights, showAuthors } = useAppState().navigationState
    const { highlights } = useHighlights(booqId)

    return useMemo(() => {
        const allAuthors = showHighlights && self?.id
            ? [self.id, ...showAuthors]
            : showAuthors
        const filteredHighlights = highlights.filter(
            h => allAuthors.some(authorId => h.author.id === authorId)
        )

        return filteredHighlights
    }, [highlights, self?.id, showAuthors, showHighlights])
}

export function useNavigationState() {
    const { showChapters, showHighlights, showAuthors } = useAppState().navigationState
    const setter = useAppStateSetter()
    return {
        showChapters, showHighlights, showAuthors,
        toggleChapters() {
            setter(prev => ({
                ...prev,
                navigationState: {
                    ...prev.navigationState,
                    showChapters: !prev.navigationState.showChapters,
                }
            }))
        },
        toggleHighlights() {
            setter(prev => ({
                ...prev,
                navigationState: {
                    ...prev.navigationState,
                    showHighlights: !prev.navigationState.showHighlights,
                }
            }))
        },
        toggleAuthor(authorId: string) {
            setter(prev => ({
                ...prev,
                navigationState: {
                    ...prev.navigationState,
                    showAuthors: prev.navigationState.showAuthors.some(id => id === authorId)
                        ? prev.navigationState.showAuthors.filter(id => id !== authorId)
                        : [authorId, ...prev.navigationState.showAuthors],
                }
            }))
        },
    }
}

export type NavigationState = {
    showChapters: boolean,
    showHighlights: boolean,
    showAuthors: string[],
};

function buildNodes({ toc, filter, highlights, title }: {
    title?: string,
    filter: string,
    toc: TocItem[],
    highlights: Highlight[],
}): NavigationNode[] {
    const nodes: NavigationNode[] = []
    let prev: TocItem = {
        title: title ?? 'Untitled',
        position: 0,
        level: 0,
        path: [0],
    }
    let prevPath: Array<TocItem | undefined> = []
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

function highlightsAuthors(highlights: Highlight[]): User[] {
    const grouped = groupBy(highlights, h => h.author.id)
    return Object.entries(grouped).map(
        ([_, [{ author }]]) => ({
            id: author.id,
            name: author.name,
            pictureUrl: author.pictureUrl ?? undefined,
        })
    )
}