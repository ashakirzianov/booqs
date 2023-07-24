import React, { useState, useMemo } from 'react'
import {
    useAuth, UserInfo, useNavigationNodes, NavigationNode,
} from '@/application'
import { IconButton } from '@/controls/Buttons'
import { TocNodeComp } from './TocNode'
import { HighlightNodeComp } from './HighlightNode'
import { PathHighlightsNodeComp } from './PathHighlightsNode'
import { NavigationFilter } from './Filter'

export function useNavigationPanel(booqId: string) {
    const [navigationOpen, setOpen] = useState(false)
    const NavigationButton = <IconButton
        icon='toc'
        onClick={() => setOpen(!navigationOpen)}
        isSelected={navigationOpen}
    />
    const NavigationContent = <Navigation
        booqId={booqId}
        closeSelf={() => {
            setOpen(false)
        }}
    />
    return {
        navigationOpen, NavigationButton, NavigationContent,
    }
}

function Navigation({ booqId, closeSelf }: {
    booqId: string,
    closeSelf: () => void,
}) {
    const self = useAuth()
    const { nodes, authors } = useNavigationNodes(booqId)
    const exceptSelf = authors.filter(a => a.id !== self?.id)
    return useMemo(() => {
        return <div className='safe-area'>
            <div className='container'>
                <div className='scrollable mt-lg'>
                    <div className='header xl:py-0 xl:px-4'>
                        <div className='label font-bold'>CONTENTS</div>
                        <div className='filter'>
                            <NavigationFilter
                                self={self}
                                authors={exceptSelf}
                            />
                        </div>
                    </div>
                    <div className='items xl:py-0 xl:px-4'>
                        {
                            nodes.map(
                                (node, idx) => <div key={idx}>
                                    <div className='py-base' onClick={closeSelf}>
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
                color: var(--theme-dimmed);
                font-size: 0.9rem;
                max-height: 100%;
            }
            .scrollable {
                display: flex;
                flex-flow: column;
                flex: 1;
                overflow: auto;
            }
            .header {
                display: flex;
                flex-flow: column;
            }
            .label {
                align-self: center;
                letter-spacing: 0.1em;
            }
            .items {
                display: flex;
                flex-flow: column;
                flex: 1 1;
            }
            hr {
                width: 85%;
                border: none;
                border-top: 0.5px solid var(--theme-border);
            }
            `}</style>
        </div>
    }, [
        nodes,
    ])
}

function NavigationNodeComp({ booqId, self, node }: {
    booqId: string,
    self: UserInfo | undefined,
    node: NavigationNode,
}) {
    switch (node.kind) {
        case 'toc':
            return <TocNodeComp
                booqId={booqId}
                node={node}
            />
        case 'highlight':
            return <HighlightNodeComp
                booqId={booqId}
                self={self}
                highlight={node.highlight}
            />
        case 'highlights':
            return <PathHighlightsNodeComp
                booqId={booqId}
                self={self}
                node={node}
            />
        default:
            return null
    }
}