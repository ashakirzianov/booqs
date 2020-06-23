import { TocItem, Highlight } from "app";
import { pathInRange } from "core";

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

export function buildNodes({ toc, filter, highlights, title }: {
    title?: string,
    filter: string,
    toc: TocItem[],
    highlights: Highlight[],
}): NavigationNode[] {
    const nodes: NavigationNode[] = [];
    let prev: TocItem = {
        title: title ?? 'Untitled',
        position: 0,
        level: 0,
        path: [0],
    };
    let prevPath: Array<TocItem | undefined> = [];
    for (const next of toc) {
        prevPath = prevPath.slice(0, prev.level);
        prevPath[prev.level] = prev;
        const inside = highlights.filter(
            hl => pathInRange(hl.start, {
                start: prev?.path ?? [0],
                end: next.path,
            }),
        );
        if (filter === 'all') {
            nodes.push(...inside.map(h => ({
                kind: 'highlight' as const,
                highlight: h,
            })));
            nodes.push({
                kind: 'toc',
                item: next,
            });
        } else if (filter === 'contents') {
            nodes.push({
                kind: 'toc',
                item: next,
            });
        } else if (filter === 'highlights') {
            if (inside.length !== 0) {
                nodes.push({
                    kind: 'highlights',
                    items: prevPath,
                    highlights: inside,
                });
            }
        }
        prev = next;
    }
    return nodes;
}