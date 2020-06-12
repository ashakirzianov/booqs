import React, { useState } from 'react';
import { BooqPath, pathInRange } from 'core';
import {
    useToc, TocItem, pageForPosition, useHighlights, Highlight,
} from 'app';
import { IconButton } from 'controls/Buttons';
import { BooqLink } from 'controls/Links';
import { meter, vars } from 'controls/theme';

export function useNavigationPanel(booqId: string) {
    const [navigationOpen, setOpen] = useState(false);
    const NavigationButton = <IconButton
        icon='toc'
        onClick={() => setOpen(!navigationOpen)}
        isSelected={navigationOpen}
    />;
    const NavigationContent = <Navigation
        booqId={booqId}
        closeSelf={() => setOpen(false)}
    />;
    return {
        navigationOpen, NavigationButton, NavigationContent,
    };
}

function Navigation({ booqId, closeSelf }: {
    booqId: string,
    closeSelf: () => void,
}) {
    const { toc, title } = useToc(booqId);
    const { highlights } = useHighlights(booqId);
    const nodes = buildNodes({
        filter: 'path',
        title, toc, highlights,
    });
    return <div className='container'>
        {
            nodes.map(
                (node, idx) => <div key={idx} onClick={closeSelf}>
                    <div className='item'>
                        <NavigationNodeComp
                            booqId={booqId}
                            node={node}
                        />
                    </div>
                    <hr />
                </div>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1 1;
                flex-flow: column nowrap;
            }
            hr {
                width: 85%;
                border: none;
                border-top: 1px solid var(${vars.border});
            }
            `}</style>
    </div>;
}

function buildNodes({ toc, filter, highlights, title }: {
    title?: string,
    filter: 'all' | 'path',
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
        if (filter === 'all') {
            nodes.push({
                kind: 'toc',
                item: next,
            });
        } else if (filter === 'path') {
            const inside = highlights.filter(
                hl => pathInRange(hl.start, {
                    start: prev?.path ?? [0],
                    end: next.path,
                }),
            );
            if (inside.length !== 0) {
                nodes.push({
                    kind: 'path-highlights',
                    items: prevPath,
                    highlights: inside,
                });
            }
        }
        prev = next;
    }
    return nodes;
}

type TocNode = {
    kind: 'toc',
    item: TocItem,
}
type PathHighlightsNode = {
    kind: 'path-highlights',
    items: Array<TocItem | undefined>,
    highlights: Highlight[],
}
type NavigationNode = TocNode | PathHighlightsNode;

function NavigationNodeComp({ booqId, node }: {
    booqId: string,
    node: NavigationNode,
}) {
    switch (node.kind) {
        case 'toc':
            return <TocNodeComp
                booqId={booqId}
                node={node}
            />;
        case 'path-highlights':
            return <PathHighlightsNodeComp
                booqId={booqId}
                node={node}
            />;
        default:
            return null;
    }
}

function TocNodeComp({
    booqId, node: { item: { path, title, position } },
}: {
    booqId: string,
    node: TocNode,
}) {
    return <>
        <BooqLink booqId={booqId} path={path}>
            <div className='content'>
                <span className='title'>{title ?? 'no-title'}</span>
                <span className='page'>{pageForPosition(position)}</span>
            </div>
        </BooqLink>
        <style jsx>{`
        .content {
            display: flex;
            flex-flow: row nowrap;
            flex: 1;
            padding: ${meter.large};
            justify-content: space-between;
        }
        `}</style>
    </>;
}

function PathHighlightsNodeComp({
    booqId,
    node: { items, highlights },
}: {
    booqId: string,
    node: PathHighlightsNode,
}) {
    return <div>
        <Path booqId={booqId} items={items} />
        {
            highlights.map(
                (hl, idx) =>
                    <HighlightComp
                        key={idx}
                        highlight={hl}
                    />
            )
        }
    </div>;
}

function Path({ items, booqId }: {
    booqId: string,
    items: Array<TocItem | undefined>,
}) {
    return <div>
        {
            items.map((item, idx) => !item ? null
                : <BooqLink booqId={booqId} path={item.path}>
                    {idx === 0 ? null : ' / '}
                    {item.title}
                </BooqLink>)
        }
    </div>;
}

// TODO: move
function HighlightComp({ highlight }: {
    highlight: Highlight,
}) {
    return <div>
        {highlight.text}
    </div>;
}
