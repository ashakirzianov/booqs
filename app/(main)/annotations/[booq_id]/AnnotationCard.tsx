'use client'

import { useState, useEffect } from 'react'
import { AnnotationAuthorData } from '@/data/annotations'
import { useBooqAnnotations } from '@/application/annotations'
import { ActionButton, LightButton } from '@/components/Buttons'
import { ExpandedAnnotationFragmentData, AnnotationFragment } from './AnnotationFragment'
import { RetryIcon } from '@/components/Icons'
import { NoteReplies } from '@/reader/NoteReplies'

export function AnnotationCard({
    noteFragmentData, user, isExpanded, onToggle, onColorChange,
}: {
    noteFragmentData: ExpandedAnnotationFragmentData,
    user: AnnotationAuthorData | undefined,
    isExpanded: boolean,
    onToggle: () => void,
    onColorChange?: (annotationId: string, newKind: string) => void,
}) {
    const { annotation, content, range } = noteFragmentData
    const { booqId } = annotation
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(annotation.content || '')
    const [removedAnnotation, setRemovedAnnotation] = useState<typeof annotation | null>(null)
    const { updateAnnotation, removeAnnotation, addAnnotation } = useBooqAnnotations({ booqId, user })

    const isNoteRemoved = removedAnnotation !== null

    // Update editContent when note content changes (but not when editing)
    useEffect(() => {
        if (!isEditing) {
            setEditContent(annotation.content || '')
        }
    }, [annotation.content, isEditing])

    function handleEditToggle() {
        if (isEditing) {
            // Save the changes
            updateAnnotation({
                annotationId: annotation.id,
                content: editContent.trim() || null
            })
        }
        setIsEditing(!isEditing)
    }

    function handleCancel() {
        setEditContent(annotation.content || '')
        setIsEditing(false)
    }

    function handleRemove() {
        setRemovedAnnotation(annotation)
        removeAnnotation({ annotationId: annotation.id })
    }

    function handleRestore() {
        if (!removedAnnotation) return
        addAnnotation({
            range: removedAnnotation.range,
            kind: removedAnnotation.kind,
            content: removedAnnotation.content || undefined,
            targetQuote: removedAnnotation.targetQuote,
            privacy: removedAnnotation.privacy || 'private',
            id: removedAnnotation.id
        })
        setRemovedAnnotation(null)
    }

    function handleColorChange(kind: string) {
        updateAnnotation({
            annotationId: annotation.id,
            kind: kind
        })
        // Notify parent component about the color change
        onColorChange?.(annotation.id, kind)
    }

    // Show removal message if note was removed
    if (isNoteRemoved) {
        return (
            <div className="bg-background py-6 transition-shadow duration-200">
                <div className="mb-4">
                    <div className="text-dimmed mb-4">Note was removed</div>
                    <LightButton
                        icon={<RetryIcon />}
                        text="Restore"
                        onClick={handleRestore}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background py-6 transition-shadow duration-200">
            <div className="mb-4 flex flex-col gap-3">
                <AnnotationFragment
                    annotation={annotation}
                    content={content}
                    range={range}
                    isExpanded={isExpanded}
                    onToggle={onToggle}
                    onColorChange={handleColorChange}
                    onRemove={handleRemove}
                />

                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            autoFocus
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
                                    e.preventDefault()
                                    handleEditToggle()
                                } else if (e.key === 'Escape') {
                                    handleCancel()
                                }
                            }}
                            placeholder="Add your note content..."
                            className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-action"
                            rows={3}
                        />
                        <div className="flex gap-2">
                            <ActionButton
                                onClick={handleEditToggle} variant="primary"
                                text="Save"
                            />
                            <ActionButton
                                onClick={handleCancel} variant="secondary"
                                text="Cancel"
                            />
                        </div>
                    </div>
                ) : (
                    <div
                        className="text-primary px-3 cursor-pointer hover:opacity-80 transition-opacity italic"
                        onClick={handleEditToggle}
                    >
                        {annotation.content || <span className="text-dimmed">Add note…</span>}
                    </div>
                )}

                <div className="px-3">
                    <NoteReplies noteId={annotation.id} user={user} collapsible />
                </div>
            </div>
        </div>
    )
}