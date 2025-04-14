import React, { useMemo } from 'react'
import { TocNodeComp } from './TocNode'
import { HighlightNodeComp } from './HighlightNode'
import { PathHighlightsNodeComp } from './PathHighlightsNode'
import { NavigationFilter } from './Filter'
import { buildNavigationNodes, NavigationNode } from './nodes'
import { NavigationSelection, ReaderHighlight, ReaderTocItem, ReaderUser } from '../common'

export function NavigationPanel({
    booqId, self, title, toc, highlights,
    selection,
    toggleSelection, closeSelf,
}: {
    booqId: string,
    title: string
    toc: ReaderTocItem[],
    highlights: ReaderHighlight[],
    selection: NavigationSelection,
    self?: ReaderUser,
    toggleSelection: (item: string) => void,
    closeSelf: () => void,
}) {
    const { nodes, authors } = useMemo(() => {
        return buildNavigationNodes({
            title, toc, highlights,
            selection,
            self,
        })
    }, [title, toc, highlights, selection, self])
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
                                authors={exceptSelf}
                                selection={selection}
                                toggle={toggleSelection}
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
        // TODO: add missing deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodes])
}

function NavigationNodeComp({ booqId, self, node }: {
    booqId: string,
    self: ReaderUser | undefined,
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