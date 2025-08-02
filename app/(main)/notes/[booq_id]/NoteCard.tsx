'use client'

import { useState, useEffect } from 'react'
import { BooqNote, NoteAuthorData } from '@/data/notes'
import { BooqId, BooqNode, BooqRange } from '@/core'
import { useBooqNotes } from '@/application/notes'
import { ActionButton, LightButton } from '@/components/Buttons'
import { NoteFragment } from './NoteFragment'

type NoteCardProps = {
    note: BooqNote
    booqId: BooqId
    user: NoteAuthorData | undefined
    expandedFragment?: { nodes: BooqNode[], range: BooqRange } | undefined
}

export function NoteCard({ note: initialNote, booqId, user, expandedFragment }: NoteCardProps) {
    const [isEditing, setIsEditing] = useState(false)
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
                <NoteFragment
                    booqId={booqId}
                    range={note.range}
                    targetQuote={note.targetQuote}
                    noteKind={note.kind}
                    onColorChange={handleColorChange}
                    onRemove={handleRemove}
                    expandedFragment={expandedFragment}
                />

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
                    <div
                        className="text-primary px-3 cursor-pointer hover:opacity-80 transition-opacity italic"
                        onClick={handleEditToggle}
                    >
                        {note.content || <span className="text-dimmed">Add note…</span>}
                    </div>
                )}
            </div>
        </div>
    )
}