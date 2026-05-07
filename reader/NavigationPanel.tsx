'use client'
import React, { useMemo } from 'react'
import { TocNodeComp } from './TocNode'
import { AnnotationNodeComp } from './AnnotationNode'
import { PathNotesNodeComp } from './PathNotesNode'
import { NavigationFilter } from './NavigationFilter'
import { buildNavigationNodes, NavigationNode } from './nodes'
import { BooqId, TableOfContentsItem } from '@/core'
import { NavigationSelection } from './useNavigationState'
import { AnnotationAuthorData, BooqAnnotation } from '@/data/annotations'

export function NavigationPanel({
    booqId, user, title, toc, annotations,
    selection, highlightAuthors,
    toggleSelection, closeSelf,
}: {
    booqId: BooqId,
    title: string
    toc: TableOfContentsItem[],
    annotations: BooqAnnotation[],
    selection: NavigationSelection,
    user?: AnnotationAuthorData,
    highlightAuthors: AnnotationAuthorData[],
    toggleSelection: (item: string) => void,
    closeSelf: () => void,
}) {
    const nodes = useMemo(() => {
        return buildNavigationNodes({
            title, toc, annotations,
            selection,
            user,
        })
    }, [title, toc, annotations, selection, user])
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
                                self={user}
                                authors={highlightAuthors}
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
    booqId: BooqId,
    user: AnnotationAuthorData | undefined,
    node: NavigationNode,
}) {
    switch (node.kind) {
        case 'toc':
            return <TocNodeComp
                booqId={booqId}
                node={node}
            />
        case 'note':
            return <AnnotationNodeComp
                booqId={booqId}
                user={user}
                annotation={node.annotation}
            />
        case 'annotations':
            return <PathNotesNodeComp
                booqId={booqId}
                user={user}
                node={node}
            />
        default:
            return null
    }
}