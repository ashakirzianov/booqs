'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BooqId, BooqNode, BooqRange } from '@/core'
import { SmallSpinner, CollapseIcon } from '@/components/Icons'
import { BooqContent, Augmentation } from '@/viewer'
import { LightButton, RemoveButton } from '@/components/Buttons'
import { ColorPicker } from '@/components/ColorPicker'
import { booqHref } from '@/common/href'

type NoteFragmentProps = {
    booqId: BooqId
    range: BooqRange
    targetQuote: string
    noteKind: string
    onColorChange: (kind: string) => void
    onRemove?: () => void
}

export function NoteFragment({ booqId, range, targetQuote, noteKind, onColorChange, onRemove }: NoteFragmentProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [expandedFragment, setExpandedFragment] = useState<{ nodes: BooqNode[], range: BooqRange } | null>(null)
    const [isLoadingExpanded, setIsLoadingExpanded] = useState(false)
    const router = useRouter()

    const augmentationColor = `hsl(from var(--color-${noteKind}) h s l / 40%)`

    // Create augmentation for the current note to highlight it in the expanded content
    const noteAugmentation = useMemo<Augmentation[]>(() => {
        if (!expandedFragment) {
            return []
        }

        return [{
            id: `note-${booqId}-${JSON.stringify(range)}`,
            range: range,
            color: augmentationColor,
        }]
    }, [expandedFragment, booqId, range, augmentationColor])

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

    function handleAugmentationClick(_id: string) {
        // Navigate to the note's range start position in the booq
        const href = booqHref({ booqId, path: range.start })
        router.push(href)
    }

    return (
        <>
            {/* Control row - shows loading or collapse button */}
            <div className="flex justify-between items-center min-h-[24px] gap-4">
                <div>
                    {isLoadingExpanded && (
                        <div className="flex items-center gap-2 text-dimmed">
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
                <div className="flex items-center gap-2">
                    {isExpanded && (
                        <>
                            {onRemove && (
                                <RemoveButton
                                    onClick={onRemove}
                                    title="Remove note"
                                    isRemoving={false}
                                />
                            )}
                            <div className='w-32 h-6 shadow-md rounded overflow-clip'>
                                <ColorPicker
                                    selectedKind={noteKind}
                                    onColorChange={onColorChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Fragment content */}
            {isExpanded && expandedFragment ? (
                <div className="rounded shadow-sm p-3 bg-background max-h-96 overflow-y-auto font-book text-primary">
                    <BooqContent
                        nodes={expandedFragment.nodes}
                        range={expandedFragment.range}
                        augmentations={noteAugmentation}
                        onAugmentationClick={handleAugmentationClick}
                    />
                </div>
            ) : (
                <div
                    className="rounded shadow-sm py-3 px-12 cursor-pointer hover:opacity-80 transition-opacity bg-background"
                    onClick={handleExpand}
                    title='Click to expand'
                >
                    <span className="font-book text-primary m-0" style={{
                        backgroundColor: augmentationColor,
                    }}>
                        {targetQuote}
                    </span>
                </div>
            )}
        </>
    )
}