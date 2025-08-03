'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BooqNode, BooqRange } from '@/core'
import { CollapseIcon } from '@/components/Icons'
import { Augmentation, BooqContent } from '@/viewer'
import { LightButton, RemoveButton } from '@/components/Buttons'
import { ColorPicker } from '@/components/ColorPicker'
import { booqHref } from '@/common/href'
import { BooqNote } from '@/data/notes'

type NoteFragmentProps = ExpandedNoteFragmentData & {
    onColorChange: (kind: string) => void,
    onRemove?: () => void,
}

export type ExpandedNoteFragmentData = {
    note: BooqNote,
    overlapping: BooqNote[],
    nodes?: BooqNode[],
    range: BooqRange,
}

export function NoteFragment({
    note, overlapping, nodes, range,
    onColorChange, onRemove,
}: NoteFragmentProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const router = useRouter()

    const augmentationColor = `hsl(from var(--color-${note.kind}) h s l / 40%)`

    // Create augmentations for the current note and all overlapping notes
    const noteAugmentations = useMemo<Augmentation[]>(() => {
        if (!nodes) {
            return []
        }

        const augmentations: Augmentation[] = []
        augmentations.push({
            id: `note-${note.id}`,
            range: note.range,
            color: augmentationColor,
        })

        // Add augmentations for all overlapping notes
        overlapping.forEach((overlappingNote) => {
            const overlappingColor = `hsl(from var(--color-${overlappingNote.kind}) h s l / 40%)`
            augmentations.push({
                id: `note-${overlappingNote.id}`,
                range: overlappingNote.range,
                color: overlappingColor,
            })
        })

        return augmentations
    }, [nodes, overlapping, note.id, note.range, augmentationColor])

    function handleExpand() {
        setIsExpanded(!isExpanded)
    }

    function handleAugmentationClick(_id: string) {
        // Navigate to the note's range start position in the booq
        const href = booqHref({ booqId: note.booqId, path: range.start })
        router.push(href)
    }

    return (
        <>
            {/* Control row - shows collapse button and controls when expanded */}
            <div className="flex justify-between items-center min-h-[24px] gap-4">
                <div>
                    {isExpanded && nodes && (
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
                                    selectedKind={note.kind}
                                    onColorChange={onColorChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Fragment content */}
            {isExpanded && nodes ? (
                <div className="rounded shadow-sm p-3 bg-background overflow-y-auto font-book text-primary">
                    <BooqContent
                        nodes={nodes}
                        range={range}
                        augmentations={noteAugmentations}
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
                        {note.targetQuote}
                    </span>
                </div>
            )}
        </>
    )
}