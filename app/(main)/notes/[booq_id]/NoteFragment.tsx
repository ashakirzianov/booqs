'use client'

import { useState, useMemo } from 'react'
import { ExternalLinkIcon } from '@/components/Icons'
import { BooqNode, BooqStyles, BooqRange } from '@/core'
import { Augmentation, BooqContent } from '@/viewer'
import { LightLink, RemoveButton } from '@/components/Buttons'
import { ColorPicker } from '@/components/ColorPicker'
import { booqContentHref } from '@/common/href'
import { BooqNote } from '@/data/notes'
import { COMMENT_KIND, QUESTION_KIND } from '@/application/notes'

type NoteFragmentProps = ExpandedNoteFragmentData & {
    onColorChange: (kind: string) => void,
    onRemove?: () => void,
}

export type ExpandedNoteFragmentData = {
    note: BooqNote,
    overlapping: BooqNote[],
    nodes?: BooqNode[],
    styles?: BooqStyles,
    range: BooqRange,
}

export function NoteFragment({
    note, nodes, styles, range,
    onColorChange, onRemove,
}: NoteFragmentProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const augmentationColor = `hsl(from var(--color-${note.kind}) h s l / 40%)`

    const isComment = isCommentOrQuestion(note.kind)

    const noteAugmentations = useMemo<Augmentation[]>(() => {
        if (!nodes) {
            return []
        }
        return [{
            id: `note-${note.id}`,
            range: note.range,
            color: isComment ? undefined : augmentationColor,
            underline: isComment ? 'dashed' as const : undefined,
        }]
    }, [nodes, note.id, note.range, augmentationColor, isComment])

    const viewInBooqHref = booqContentHref({ booqId: note.booqId, path: range.start })

    function handleToggle() {
        setIsExpanded(!isExpanded)
    }

    return (
        <>
            {/* Control row */}
            <div className="flex justify-between items-center h-6 gap-4">
                <div>
                    {isExpanded && (
                        <LightLink
                            text="View in booq"
                            icon={<ExternalLinkIcon />}
                            iconPosition="right"
                            href={viewInBooqHref}
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
                            {!isCommentOrQuestion(note.kind) && (
                                <div className='w-32 h-6 shadow-md rounded overflow-clip'>
                                    <ColorPicker
                                        selectedKind={note.kind}
                                        onColorChange={onColorChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Fragment content — click to expand/collapse */}
            {isExpanded && nodes ? (
                <div
                    className="rounded shadow-sm py-3 px-12 bg-background overflow-y-auto font-book text-primary cursor-pointer"
                    onClick={handleToggle}
                >
                    <BooqContent
                        nodes={nodes}
                        styles={styles ?? {}}
                        range={range}
                        augmentations={noteAugmentations}
                    />
                </div>
            ) : (
                <div
                    className="rounded shadow-sm py-3 px-12 cursor-pointer hover:opacity-80 transition-opacity bg-background"
                    onClick={handleToggle}
                    title='Click to expand'
                >
                    <span className="font-book text-primary m-0" style={{
                        backgroundColor: isComment ? undefined : augmentationColor,
                        textDecoration: isComment ? 'underline' : undefined,
                        textDecorationStyle: isComment ? 'dashed' : undefined,
                    }}>
                        {note.targetQuote}
                    </span>
                </div>
            )}
        </>
    )
}

function isCommentOrQuestion(kind: string): boolean {
    return kind === COMMENT_KIND || kind === QUESTION_KIND
}

// Builds augmentations for a note and its overlapping neighbors.
// Can be used to show all nearby highlights in the expanded note preview,
// e.g. to give the reader context about other annotations in the same passage.
// Currently unused — kept for future use if we want to restore overlapping highlights.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildAugmentationsWithOverlapping(
    note: BooqNote,
    overlapping: BooqNote[],
): Augmentation[] {
    const color = `hsl(from var(--color-${note.kind}) h s l / 40%)`
    const augmentations: Augmentation[] = [{
        id: `note-${note.id}`,
        range: note.range,
        color,
    }]
    overlapping.forEach((overlappingNote) => {
        augmentations.push({
            id: `note-${overlappingNote.id}`,
            range: overlappingNote.range,
            color: `hsl(from var(--color-${overlappingNote.kind}) h s l / 40%)`,
        })
    })
    return augmentations
}