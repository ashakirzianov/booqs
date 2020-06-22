import React, { useState, useMemo } from 'react';
import { pathInRange } from 'core';
import {
    useToc, TocItem, pageForPosition, useHighlights, Highlight, colorForGroup,
} from 'app';
import { IconButton } from 'controls/Buttons';
import { BooqLink } from 'controls/Links';
import { meter, vars, boldWeight, isSmallScreen, smallScreenWidth } from 'controls/theme';
import { useFilterPanel } from 'controls/FilterPanel';
import { Overlay } from 'controls/Popover';
import { Icon } from 'controls/Icon';
import { ContextMenuContent } from './ContextMenuContent';

export function useNavigationPanel(booqId: string) {
    const [navigationOpen, setOpen] = useState(false);
    const NavigationButton = <IconButton
        icon='toc'
        onClick={() => setOpen(!navigationOpen)}
        isSelected={navigationOpen}
    />;
    const NavigationContent = <Navigation
        booqId={booqId}
        closeSelf={() => {
            if (isSmallScreen()) {
                setOpen(false);
            }
        }}
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
    const { filter, FilterNode } = useFilterPanel({
        items: [
            { text: 'All', value: 'all' },
            { text: 'Highlights', value: 'highlights' },
            { text: 'Chapters', value: 'contents' },
        ],
        initial: 'all',
    });
    const nodes = useMemo(() => buildNodes({
        filter,
        title, toc, highlights,
    }), [filter, title, toc, highlights]);
    return useMemo(() => {
        return <div className='safe-area'>
            <div className='container'>

                <div className='header'>
                    <div className='label'>CONTENTS</div>
                    <div className='filter'>
                        {FilterNode}
                    </div>
                </div>
                <div className='items'>
                    {
                        nodes.map(
                            (node, idx) => <div key={idx}>
                                <div className='item' onClick={closeSelf}>
                                    <NavigationNodeComp
                                        booqId={booqId}
                                        node={node}
                                    />
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
            <style jsx>{`
            .safe-area {
                display: flex;
                flex: 1;
                padding: 0 env(safe-area-inset-right) 0 env(safe-area-inset-left);
            }
            .container {
                display: flex;
                flex: 1 1;
                flex-flow: column;
                color: var(${vars.dimmed});
                font-size: 0.9rem;
                max-height: 100%;
            }
            .header {
                display: flex;
                flex-flow: column;
                font-weight: ${boldWeight};
            }
            .label {
                align-self: center;
                letter-spacing: 0.1em;
            }
            .items {
                display: flex;
                flex-flow: column;
                flex: 1 1;
                overflow: auto;
            }
            .item {
                padding: ${meter.regular} 0;
            }
            hr {
                width: 85%;
                border: none;
                border-top: 0.5px solid var(${vars.border});
            }
            @media (min-width: ${smallScreenWidth}) {
                .items {
                    padding: 0 ${meter.large};
                }
                .header {
                    padding: 0 ${meter.large};
                }
            }
            `}</style>
        </div>;
    }, [
        filter, nodes,
    ]);
}

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
        case 'highlight':
            return <HighlightNodeComp
                booqId={booqId}
                highlight={node.highlight}
            />;
        case 'highlights':
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
            justify-content: space-between;
            font-weight: ${boldWeight};
        }
        .content:hover {
            color: var(${vars.highlight});
        }
        .page {
            margin-left: ${meter.regular};
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
                    <div key={idx} className='highlight'>
                        <HighlightNodeComp
                            booqId={booqId}
                            highlight={hl}
                        />
                    </div>
            )
        }
        <style jsx>{`
            .highlight {
                margin: ${meter.regular} 0;
            }
            `}</style>
    </div>;
}

function Path({ items, booqId }: {
    booqId: string,
    items: Array<TocItem | undefined>,
}) {
    return <div className='container'>
        {
            items.map((item, idx) => !item ? null
                : <>
                    {idx === 0 ? null : <div className='separator'>/</div>}
                    <div className='element'>
                        <BooqLink booqId={booqId} path={item.path}>

                            {item.title}
                        </BooqLink>
                    </div>
                </>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: row wrap;
            }
            .element {
                margin: 0 ${meter.regular} 0 0;
                font-weight: ${boldWeight};
            }
            .element:hover {
                text-decoration: underline;
            }
            .separator {
                margin: 0 ${meter.regular} 0 0;
            }
            `}</style>
    </div>;
}

function HighlightNodeComp({ booqId, highlight }: {
    booqId: string,
    highlight: Highlight,
}) {
    const smallScreen = isSmallScreen();
    return <div className='container'>
        <div className='text'>
            <BooqLink booqId={booqId} path={highlight.start}>
                {highlight.text}
            </BooqLink>
        </div>
        <div className='side'>
            <Overlay
                placement='right-start'
                hideOnClick={true}
                anchor={<div className='more'>
                    <Icon name='more' />
                </div>}
                content={<div className='menu'>
                    <ContextMenuContent
                        booqId={booqId}
                        setTarget={() => undefined}
                        target={{
                            kind: 'highlight',
                            highlight,
                        }}
                    />
                </div>}
            />
            <div className='page'>
                {
                    highlight.position ? pageForPosition(highlight.position) : null
                }
            </div>
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: row;
                justify-content: space-between;
                border-left: 3px solid ${colorForGroup(highlight.group)};
                padding-left: ${meter.regular};
            }
            .container:hover {
            }
            .text {
                display: flex;
                flex: 1;
                color: var(${vars.primary});
                text-align: justify;
            }
            .side {
                display: flex;
                flex-flow: column;
                justify-content: space-between;
                align-items: stretch;
                margin-left: ${meter.large};
            }
            .page {
                margin-top: ${meter.regular};
                font-weight: ${boldWeight};
            }
            .container:hover .more {
                color: var(${vars.dimmed});
            }
            .more {
                display: flex;
                justify-content: center;
                cursor: pointer;
                font-size: x-large;
                color: ${smallScreen ? `var(${vars.dimmed})` : `var(${vars.background})`};
                width: ${meter.large};
            }
            .more:hover {
                color: var(${vars.highlight});
            }
            .menu {
                width: 12rem;
                pointer-events: auto;
            }
            `}</style>
    </div>;
}

type TocNode = {
    kind: 'toc',
    item: TocItem,
}
type HighlightNode = {
    kind: 'highlight',
    highlight: Highlight,
};
type PathHighlightsNode = {
    kind: 'highlights',
    items: Array<TocItem | undefined>,
    highlights: Highlight[],
}
type NavigationNode = TocNode | HighlightNode | PathHighlightsNode;

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