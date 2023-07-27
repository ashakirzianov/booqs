import React, { useState, useMemo } from 'react'
import { IconButton } from '@/components/Buttons'
import { TocNodeComp } from './TocNode'
import { HighlightNodeComp } from './HighlightNode'
import { PathHighlightsNodeComp } from './PathHighlightsNode'
import { NavigationFilter } from './Filter'
import { User } from '@/application/auth'
import { NavigationNode, useNavigationNodes } from '@/application/navigation'

export function useNavigationPanel(booqId: string, self: User | undefined) {
    const [navigationOpen, setOpen] = useState(false)
    const NavigationButton = <IconButton
        icon='toc'
        onClick={() => setOpen(!navigationOpen)}
        isSelected={navigationOpen}
    />
    const NavigationContent = <Navigation
        booqId={booqId}
        self={self}
        closeSelf={() => {
            setOpen(false)
        }}
    />
    return {
        navigationOpen, NavigationButton, NavigationContent,
    }
}

function Navigation({ booqId, self, closeSelf }: {
    booqId: string,
    self: User | undefined,
    closeSelf: () => void,
}) {
    const { nodes, authors } = useNavigationNodes(booqId, self)
    const exceptSelf = authors.filter(a => a.id !== self?.id)
    return useMemo(() => {
        return <div className='flex flex-1' style={{
            padding: '0 env(safe-area-inset-right) 0 env(safe-area-inset-left)',
        }}>
            <div className='flex flex-1 flex-col text-dimmed max-h-full text-sm'>
                <div className='flex flex-col flex-1 overflow-auto mt-lg'>
                    <div className='flex flex-col xl:py-0 xl:px-4'>
                        <div className='self-center tracking-widest font-bold'>CONTENTS</div>
                        <div className='filter'>
                            <NavigationFilter
                                self={self}
                                authors={exceptSelf}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col flex-1 xl:py-0 xl:px-4'>
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
        </div>
    }, [
        nodes, // TODO: add missing deps
    ])
}

function NavigationNodeComp({ booqId, self, node }: {
    booqId: string,
    self: User | undefined,
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