'use client'

import { useMemo } from 'react'
import { ExternalLinkIcon } from '@/components/Icons'
import { BooqNode, BooqStyles, BooqRange } from '@/core'
import { BooqContent } from '@/viewer'
import { LightLink, RemoveButton } from '@/components/Buttons'
import { ColorPicker } from '@/components/ColorPicker'
import { booqContentHref } from '@/common/href'
import { BooqAnnotation } from '@/data/annotations'
import { COMMENT_KIND, QUESTION_KIND, augmentationForAnnotation } from '@/application/annotations'

type AnnotationFragmentProps = ExpandedAnnotationFragmentData & {
    isExpanded: boolean,
    onToggle: () => void,
    onColorChange: (color: string) => void,
    onRemove?: () => void,
}

export type ExpandedAnnotationFragmentData = {
    annotation: BooqAnnotation,
    content?: BooqNode[],
    styles?: BooqStyles,
    range: BooqRange,
}

export function AnnotationFragment({
    annotation, content, styles, range,
    isExpanded, onToggle,
    onColorChange, onRemove,
}: AnnotationFragmentProps) {
    const noteAugmentations = useMemo(() => {
        if (!content) {
            return []
        }
        return [augmentationForAnnotation(annotation)]
    }, [content, annotation])

    const viewInBooqHref = booqContentHref({ booqId: annotation.booqId, path: range.start })

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
                            {!isCommentOrQuestion(annotation.kind) && (
                                <div className='w-32 h-6 shadow rounded overflow-clip'>
                                    <ColorPicker
                                        selectedColor={annotation.color}
                                        onColorChange={onColorChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Fragment content — click to expand/collapse */}
            {isExpanded && content ? (
                <div
                    className="rounded shadow py-3 px-12 bg-background overflow-y-auto font-book text-primary cursor-pointer"
                    onClick={onToggle}
                >
                    <BooqContent
                        nodes={content}
                        styles={styles ?? {}}
                        range={range}
                        augmentations={noteAugmentations}
                    />
                </div>
            ) : (
                <div
                    className="rounded shadow py-3 px-12 cursor-pointer hover:opacity-80 transition-opacity bg-background font-book text-primary"
                    onClick={onToggle}
                    title='Click to expand'
                >
                    <span className="m-0" style={collapsedStyleForAnnotation(annotation)}>
                        {annotation.locator.text}
                    </span>
                </div>
            )}
        </>
    )
}

function isCommentOrQuestion(kind: string): boolean {
    return kind === COMMENT_KIND || kind === QUESTION_KIND
}

function collapsedStyleForAnnotation(annotation: BooqAnnotation): React.CSSProperties {
    const aug = augmentationForAnnotation(annotation)
    return {
        backgroundColor: aug.color,
        textDecoration: aug.underline ? 'underline' : undefined,
        textDecorationStyle: aug.underline,
    }
}

