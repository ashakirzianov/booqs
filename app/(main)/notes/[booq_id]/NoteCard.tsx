'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BooqNote, NoteAuthorData } from '@/data/notes'
import { booqHref } from '@/common/href'
import { BooqId } from '@/core'
import { useBooqNotes } from '@/application/notes'

type NoteCardProps = {
    note: BooqNote
    booqId: BooqId
    user: NoteAuthorData | undefined
}

export function NoteCard({ note: initialNote, booqId, user }: NoteCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(initialNote.content || '')
    const { notes, updateNote } = useBooqNotes({ booqId, user })
    
    // Use the updated note from the hook, fall back to initial note if not found
    const note = notes.find(n => n.id === initialNote.id) || initialNote

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
                content: editContent.trim() || undefined
            })
        }
        setIsEditing(!isEditing)
    }

    function handleCancel() {
        setEditContent(note.content || '')
        setIsEditing(false)
    }

    return (
        <div className="bg-white p-6 transition-shadow duration-200">
            <div className="mb-4">
                <div className='rounded shadow-sm p-3'>
                    <span className="italic text-primary m-0" style={{
                        backgroundColor: `var(--color-${note.kind})`,
                    }}>
                        {note.targetQuote}
                    </span>
                </div>
                
                {isEditing ? (
                    <div className="mt-4">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Add your note content..."
                            className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-action"
                            rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleEditToggle}
                                className="bg-action hover:bg-highlight text-light px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-gray-300 hover:bg-gray-400 text-primary px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {note.content && (
                            <div className="text-primary mt-4 p-3">
                                {note.content}
                            </div>
                        )}
                        <div className="mt-3">
                            <button
                                onClick={handleEditToggle}
                                className="text-action hover:text-highlight hover:underline text-sm font-medium transition-colors duration-200"
                            >
                                {note.content ? 'Edit note' : 'Add note'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center justify-between text-sm pt-4">
                <Link
                    href={booqHref({ booqId, path: note.range.start })}
                    className="hover:text-highlight hover:underline text-action px-4 py-2 rounded font-medium transition-colors duration-200"
                >
                    Show in booq
                </Link>
            </div>
        </div>
    )
}