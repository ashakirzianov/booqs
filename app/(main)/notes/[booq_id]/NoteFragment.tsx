'use client'

import { useState } from 'react'
import { BooqId, BooqNode, BooqRange } from '@/core'
import { SmallSpinner, CollapseIcon } from '@/components/Icons'
import { BooqContent } from '@/viewer'
import { LightButton } from '@/components/Buttons'

type NoteFragmentProps = {
    booqId: BooqId
    range: BooqRange
    targetQuote: string
    noteKind: string
}

export function NoteFragment({ booqId, range, targetQuote, noteKind }: NoteFragmentProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [expandedFragment, setExpandedFragment] = useState<{ nodes: BooqNode[], range: BooqRange } | null>(null)
    const [isLoadingExpanded, setIsLoadingExpanded] = useState(false)

    async function handleExpand() {
        if (isExpanded) {
            setIsExpanded(false)
            return
        }

        // If we already have the expanded fragment cached, just show it
        if (expandedFragment) {
            setIsExpanded(true)
            return
        }

        // Otherwise, fetch it for the first time
        setIsLoadingExpanded(true)
        try {
            const rangeParam = encodeURIComponent(JSON.stringify(range))
            const response = await fetch(`/api/booq/${booqId}/expanded-fragment?range=${rangeParam}`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch expanded fragment')
            }
            
            const data = await response.json()
            setExpandedFragment({ nodes: data.nodes, range: data.range })
            setIsExpanded(true)
        } catch (error) {
            console.error('Error fetching expanded fragment:', error)
        } finally {
            setIsLoadingExpanded(false)
        }
    }

    return (
        <>
            {/* Control row - shows loading or collapse button */}
            <div className="flex justify-end min-h-[24px]">
                {isLoadingExpanded && (
                    <div className="flex items-center gap-1 text-dimmed">
                        <SmallSpinner />
                        <span className="text-sm">Loading...</span>
                    </div>
                )}
                {isExpanded && expandedFragment && (
                    <LightButton
                        text="Collapse"
                        icon={<CollapseIcon />}
                        onClick={handleExpand}
                    />
                )}
            </div>

            {/* Fragment content */}
            {isExpanded && expandedFragment ? (
                <div className="rounded shadow-sm p-3 bg-gray-50 max-h-96 overflow-y-auto">
                    <BooqContent
                        nodes={expandedFragment.nodes}
                        range={expandedFragment.range}
                        augmentations={[]}
                    />
                </div>
            ) : (
                <div 
                    className="rounded shadow-sm p-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleExpand}
                    title='Click to expand'
                >
                    <span className="font-book text-primary m-0" style={{
                        backgroundColor: `hsl(from var(--color-${noteKind}) h s l / 40%)`,
                    }}>
                        {targetQuote}
                    </span>
                </div>
            )}
        </>
    )
}