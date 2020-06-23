import React, { useState, useMemo } from 'react';
import { useToc, useHighlights, useAuth } from 'app';
import { IconButton } from 'controls/Buttons';
import { meter, vars, boldWeight, isSmallScreen, smallScreenWidth } from 'controls/theme';
import { useFilterPanel } from 'controls/FilterPanel';
import { buildNodes, NavigationNode } from './model';
import { TocNodeComp } from './TocNode';
import { HighlightNodeComp } from './HighlightNode';
import { PathHighlightsNodeComp } from './PathHighlightsNode';

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
    const { id } = useAuth() ?? {};
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
                                        selfId={id ?? 'why'}
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

function NavigationNodeComp({ booqId, selfId, node }: {
    booqId: string,
    selfId: string | undefined,
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
                selfId={selfId}
                highlight={node.highlight}
            />;
        case 'highlights':
            return <PathHighlightsNodeComp
                booqId={booqId}
                selfId={selfId}
                node={node}
            />;
        default:
            return null;
    }
}