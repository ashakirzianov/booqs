'use client'

import { useMemo } from 'react'
import { ExternalLinkIcon } from '@/components/Icons'
import { BooqNode, BooqStyles, BooqRange } from '@/core'
import { BooqContent } from '@/viewer'
import { LightLink, RemoveButton } from '@/components/Buttons'
import { ColorPicker } from '@/components/ColorPicker'
import { booqContentHref } from '@/common/href'
import { BooqNote } from '@/data/notes'
import { COMMENT_KIND, QUESTION_KIND, augmentationForNote } from '@/application/notes'

type NoteFragmentProps = ExpandedNoteFragmentData & {
    isExpanded: boolean,
    onToggle: () => void,
    onColorChange: (kind: string) => void,
    onRemove?: () => void,
}

export type ExpandedNoteFragmentData = {
    note: BooqNote,
    nodes?: BooqNode[],
    styles?: BooqStyles,
    range: BooqRange,
}

export function NoteFragment({
    note, nodes, styles, range,
    isExpanded, onToggle,
    onColorChange, onRemove,
}: NoteFragmentProps) {
    const noteAugmentations = useMemo(() => {
        if (!nodes) {
            return []
        }
        return [augmentationForNote(note)]
    }, [nodes, note])

    const viewInBooqHref = booqContentHref({ booqId: note.booqId, path: range.start })

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
                    onClick={onToggle}
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
                    className="rounded shadow-sm py-3 px-12 cursor-pointer hover:opacity-80 transition-opacity bg-background font-book text-primary"
                    onClick={onToggle}
                    title='Click to expand'
                >
                    <span className="m-0" style={collapsedStyleForNote(note)}>
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

function collapsedStyleForNote(note: BooqNote): React.CSSProperties {
    const aug = augmentationForNote(note)
    return {
        backgroundColor: aug.color,
        textDecoration: aug.underline ? 'underline' : undefined,
        textDecorationStyle: aug.underline,
    }
}

