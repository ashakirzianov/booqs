import React, { useState, useMemo } from 'react';
import { useToc, useHighlights, useAuth, UserData, Highlight } from 'app';
import { IconButton } from 'controls/Buttons';
import { meter, vars, boldWeight, isSmallScreen, smallScreenWidth } from 'controls/theme';
import { buildNodes, NavigationNode } from './model';
import { TocNodeComp } from './TocNode';
import { HighlightNodeComp } from './HighlightNode';
import { PathHighlightsNodeComp } from './PathHighlightsNode';
import { NavigationFilter } from './Filter';
import { groupBy } from 'lodash';

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
    const self = useAuth();
    const { toc, title } = useToc(booqId);
    const { highlights } = useHighlights(booqId);
    const allAuthors = highlightsAuthors(highlights);
    const exceptSelf = allAuthors.filter(a => a.id !== self?.id);
    const nodes = useMemo(() => buildNodes({
        filter: 'highlights',
        title, toc, highlights,
    }), [title, toc, highlights]);
    return useMemo(() => {
        return <div className='safe-area'>
            <div className='container'>
                <div className='scrollable'>
                    <div className='header'>
                        <div className='label'>CONTENTS</div>
                        <div className='filter'>
                            <NavigationFilter
                                self={self}
                                authors={exceptSelf}
                            />
                        </div>
                    </div>
                    <div className='items'>
                        {
                            nodes.map(
                                (node, idx) => <div key={idx}>
                                    <div className='item' onClick={closeSelf}>
                                        <NavigationNodeComp
                                            booqId={booqId}
                                            self={self}
                                            node={node}
                                        />
                                    </div>
                                </div>
                            )
                        }
                    </div>
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
            .scrollable {
                display: flex;
                flex-flow: column;
                flex: 1;
                overflow: auto;
                margin-top: ${meter.large};
            }
            .header {
                display: flex;
                flex-flow: column;
            }
            .label {
                align-self: center;
                letter-spacing: 0.1em;
                font-weight: ${boldWeight};
            }
            .items {
                display: flex;
                flex-flow: column;
                flex: 1 1;
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
        nodes,
    ]);
}

function NavigationNodeComp({ booqId, self, node }: {
    booqId: string,
    self: UserData | undefined,
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
                self={self}
                highlight={node.highlight}
            />;
        case 'highlights':
            return <PathHighlightsNodeComp
                booqId={booqId}
                self={self}
                node={node}
            />;
        default:
            return null;
    }
}

function highlightsAuthors(highlights: Highlight[]): UserData[] {
    const grouped = groupBy(highlights, h => h.author.id);
    const authors = Object.entries(grouped).map(
        ([_, [first]]) => first.author
    );
    return authors;
}