import React from 'react'
import { BooqNote } from '@/core'
import { resolveNoteColor } from '@/application/common'

type NotesPanelProps = {
    notes: BooqNote[],
}

export function NotesPanel({ notes }: NotesPanelProps) {
    return (
        <div className='flex flex-col h-full'>
            <div className='p-4 border-b border-gray-200'>
                <div className='self-center tracking-widest font-bold'>NOTES</div>
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                {notes.length === 0 ? (
                    <div className='text-gray-500 text-center py-8'>
                        No notes available
                    </div>
                ) : (
                    notes.map(note => (
                        <NoteItem key={note.id} note={note} />
                    ))
                )}
            </div>
        </div>
    )
}

function NoteItem({ note }: { note: BooqNote }) {
    return (
        <div className='border border-gray-200 rounded-lg p-3 space-y-2'>
            {/* Note color indicator */}
            <div className='flex items-center gap-2'>
                <div
                    className='w-3 h-3 rounded-full'
                    style={{
                        backgroundColor: resolveNoteColor(note.color),
                    }}
                />
                <span className='text-xs text-gray-500'>
                    {note.author.name || 'Anonymous'}
                </span>
            </div>

            {/* Referenced text */}
            <div className='bg-gray-50 p-2 rounded text-sm italic border-l-2'
                style={{ borderLeftColor: note.color }}>
                &quot;{note.text}&quot;
            </div>

            {/* Note content */}
            {note.content && (
                <div className='text-sm'>
                    {note.content}
                </div>
            )}

            {/* Note metadata */}
            <div className='text-xs text-gray-400 pt-1'>
                {new Date(note.createdAt).toLocaleDateString()}
            </div>
        </div>
    )
}