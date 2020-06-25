import { atom, useRecoilValue, useRecoilState } from "recoil";
import { groupBy } from "lodash";
import { pathInRange } from "core";
import {
    TocItem, Highlight, useToc, useHighlights, UserData,
} from "app";
import { syncStorageCell } from "plat";
import { useAuth } from "./auth";

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

export function useNavigationNodes(booqId: string) {
    const { showChapters, showHighlights, showAuthors } = useRecoilValue(navigationState);
    const self = useAuth();
    const { toc, title } = useToc(booqId);
    const { highlights } = useHighlights(booqId);
    const authors = highlightsAuthors(highlights);

    const allAuthors = showHighlights && self?.id
        ? [self.id, ...showAuthors]
        : showAuthors;
    const filteredHighlights = highlights.filter(
        h => allAuthors.some(authorId => h.author.id === authorId)
    );

    const filter = showChapters
        ? (showHighlights ? 'all' : 'contents')
        : (showHighlights ? 'highlights' : 'none');
    const nodes = buildNodes({
        filter, title, toc,
        highlights: filteredHighlights,
    });

    return {
        nodes,
        authors,
    };
}

export function useNavigationState() {
    const [{ showChapters, showHighlights, showAuthors }, setter] = useRecoilState(navigationState);
    return {
        showChapters, showHighlights, showAuthors,
        toggleChapters() {
            setter(prev => ({
                ...prev, showChapters: !prev.showChapters,
            }));
        },
        toggleHighlights() {
            setter(prev => ({
                ...prev, showHighlights: !prev.showHighlights,
            }));
        },
        toggleAuthor(authorId: string) {
            setter(prev => ({
                ...prev,
                showAuthors: prev.showAuthors.some(id => id === authorId)
                    ? prev.showAuthors.filter(id => id !== authorId)
                    : [authorId, ...prev.showAuthors],
            }));
        },
    }
}

type NavigationState = {
    showChapters: boolean,
    showHighlights: boolean,
    showAuthors: string[],
};
const key = 'navigation';
const storage = syncStorageCell<NavigationState>(key);
const defaultState: NavigationState = {
    showChapters: true,
    showHighlights: true,
    showAuthors: [],
};
storage.store(defaultState);
const navigationState = atom({
    key,
    default: defaultState,
});

function buildNodes({ toc, filter, highlights, title }: {
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

function highlightsAuthors(highlights: Highlight[]): UserData[] {
    const grouped = groupBy(highlights, h => h.author.id);
    return Object.entries(grouped).map(
        ([_, [{ author }]]) => ({
            id: author.id,
            name: author.name,
            pictureUrl: author.pictureUrl ?? undefined,
        })
    );
}