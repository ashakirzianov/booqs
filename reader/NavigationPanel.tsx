'use client'
import React, { useMemo, useState } from 'react'
import { TocNodeComp } from './TocNode'
import { NoteNodeComp } from './NoteNode'
import { PathNotesNodeComp } from './PathNotesNode'
import { NavigationFilter } from './Filter'
import { buildNavigationNodes, NavigationNode, NavigationSelection } from './nodes'
import { AccountDisplayData, BooqNote, TableOfContentsItem } from '@/core'

export function useNavigationState() {
    const [navigationOpen, setNavigationOpen] = useState(false)
    const [navigationSelection, setNavigationSelection] = useState<NavigationSelection>({
        chapters: true,
        notes: true,
    })
    return {
        navigationOpen,
        navigationSelection,
        closeNavigation() {
            setNavigationOpen(false)
        },
        toggleNavigationOpen() {
            setNavigationOpen((prev) => !prev)
        },
        toggleNavigationSelection(item: string) {
            setNavigationSelection(prev => ({
                ...prev,
                [item]: prev[item] !== true,
            }))
        },
    }
}

export function NavigationPanel({
    booqId, user, title, toc, notes,
    selection,
    toggleSelection, closeSelf,
}: {
    booqId: string,
    title: string
    toc: TableOfContentsItem[],
    notes: BooqNote[],
    selection: NavigationSelection,
    user?: AccountDisplayData,
    toggleSelection: (item: string) => void,
    closeSelf: () => void,
}) {
    const { nodes, authors } = useMemo(() => {
        return buildNavigationNodes({
            title, toc, notes,
            selection,
            user,
        })
    }, [title, toc, notes, selection, user])
    const exceptSelf = authors.filter(a => a.id !== user?.id)
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
                                            user={user}
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

function NavigationNodeComp({ booqId, user, node }: {
    booqId: string,
    user: AccountDisplayData | undefined,
    node: NavigationNode,
}) {
    switch (node.kind) {
        case 'toc':
            return <TocNodeComp
                booqId={booqId}
                node={node}
            />
        case 'note':
            return <NoteNodeComp
                booqId={booqId}
                user={user}
                note={node.note}
            />
        case 'notes':
            return <PathNotesNodeComp
                booqId={booqId}
                user={user}
                node={node}
            />
        default:
            return null
    }
}