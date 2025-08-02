'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BooqNote, NoteAuthorData } from '@/data/notes'
import { booqHref } from '@/common/href'
import { BooqId } from '@/core'
import { useBooqNotes } from '@/application/notes'
import { ActionButton, LightButton } from '@/components/Buttons'
import { PencilIcon, TrashIcon, BrushIcon } from '@/components/Icons'
import { ColorPicker } from '@/components/ColorPicker'

type NoteCardProps = {
    note: BooqNote
    booqId: BooqId
    user: NoteAuthorData | undefined
}

export function NoteCard({ note: initialNote, booqId, user }: NoteCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [editContent, setEditContent] = useState(initialNote.content || '')
    const [removedNote, setRemovedNote] = useState<BooqNote | null>(null)
    const { notes, updateNote, removeNote, addNote } = useBooqNotes({ booqId, user })

    // Use the updated note from the hook, fall back to initial note if not found
    const note = notes.find(n => n.id === initialNote.id) || initialNote
    const isNoteRemoved = !notes.find(n => n.id === initialNote.id) && removedNote !== null

    // Update editContent when note content changes (but not when editing)
    useEffect(() => {
        if (!isEditing) {
            setEditContent(note.content || '')
        }
    }, [note.content, isEditing])

    function handleEditToggle() {
        if (isEditing) {
            // Save the changes
            updateNote({
                noteId: note.id,
                content: editContent.trim() || null
            })
        }
        setIsEditing(!isEditing)
    }

    function handleCancel() {
        setEditContent(note.content || '')
        setIsEditing(false)
    }

    function handleRemove() {
        setRemovedNote(note)
        removeNote({ noteId: note.id })
    }

    function handleRestore() {
        if (!removedNote) return
        addNote({
            range: removedNote.range,
            kind: removedNote.kind,
            content: removedNote.content || undefined,
            targetQuote: removedNote.targetQuote,
            privacy: removedNote.privacy || 'private'
        })
        setRemovedNote(null)
    }

    function handleColorChange(kind: string) {
        updateNote({
            noteId: note.id,
            kind: kind
        })
        setShowColorPicker(false)
    }

    // Show removal message if note was removed
    if (isNoteRemoved) {
        return (
            <div className="bg-white p-6 transition-shadow duration-200">
                <div className="mb-4">
                    <div className="text-dimmed mb-4">Note was removed</div>
                    <LightButton
                        text="Restore"
                        onClick={handleRestore}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 transition-shadow duration-200">
            <div className="mb-4 flex flex-col gap-3">
                <div className='rounded shadow-sm p-3'>
                    <span className="font-book text-primary m-0" style={{
                        backgroundColor: `hsl(from var(--color-${note.kind}) h s l / 40%)`,
                    }}>
                        {note.targetQuote}
                    </span>
                </div>

                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
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
                    <>
                        {note.content && (
                            <div className="text-primary px-3">
                                {note.content}
                            </div>
                        )}
                    </>
                )}
            </div>

            {!isEditing && <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                        <LightButton
                            text={note.content ? 'Edit note' : 'Add note'}
                            icon={<PencilIcon />}
                            onClick={handleEditToggle}
                        />
                        <LightButton
                            text="Remove"
                            icon={<TrashIcon />}
                            onClick={handleRemove}
                        />
                        <LightButton
                            text={showColorPicker ? 'Hide colors' : 'Change color'}
                            icon={<BrushIcon />}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                        />
                    </div>

                    <Link
                        href={booqHref({ booqId, path: note.range.start })}
                    >
                        <LightButton
                            text='Show in booq'
                        />
                    </Link>
                </div>

                {showColorPicker && (
                    <div className="rounded overflow-clip">
                        <ColorPicker
                            selectedKind={note.kind}
                            onColorChange={handleColorChange}
                        />
                    </div>
                )}
            </div>}
        </div>
    )
}