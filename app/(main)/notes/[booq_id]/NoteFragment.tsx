'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BooqId, BooqNode, BooqRange } from '@/core'
import { CollapseIcon } from '@/components/Icons'
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
    expandedFragment?: { nodes: BooqNode[], range: BooqRange } | undefined
}

export function NoteFragment({
    booqId, range, targetQuote, noteKind,
    expandedFragment: preloadedFragment,
    onColorChange, onRemove,
}: NoteFragmentProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const router = useRouter()

    const augmentationColor = `hsl(from var(--color-${noteKind}) h s l / 40%)`

    // Create augmentation for the current note to highlight it in the expanded content
    const noteAugmentation = useMemo<Augmentation[]>(() => {
        if (!preloadedFragment) {
            return []
        }

        return [{
            id: `note-${booqId}-${JSON.stringify(range)}`,
            range: range,
            color: augmentationColor,
        }]
    }, [preloadedFragment, booqId, range, augmentationColor])

    function handleExpand() {
        setIsExpanded(!isExpanded)
    }

    function handleAugmentationClick(_id: string) {
        // Navigate to the note's range start position in the booq
        const href = booqHref({ booqId, path: range.start })
        router.push(href)
    }

    return (
        <>
            {/* Control row - shows collapse button and controls when expanded */}
            <div className="flex justify-between items-center min-h-[24px] gap-4">
                <div>
                    {isExpanded && preloadedFragment && (
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
            {isExpanded && preloadedFragment ? (
                <div className="rounded shadow-sm p-3 bg-background max-h-96 overflow-y-auto font-book text-primary">
                    <BooqContent
                        nodes={preloadedFragment.nodes}
                        range={preloadedFragment.range}
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