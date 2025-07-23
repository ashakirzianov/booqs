import Link from 'next/link'
import * as clipboard from 'clipboard-polyfill'
import { useMemo, useState } from 'react'
import { AuthorData, BooqId, userHref } from '@/core'
import type { ContextMenuTarget, NoteTarget } from './ContextMenuContent'
import { ColorPicker } from './ColorPicker'
import { formatRelativeTime } from '@/application/common'
import { HIGHLIGHT_KINDS, useBooqNotes } from '@/application/notes'
import { ProfileBadge } from '@/components/ProfilePicture'
import { CommentIcon, RemoveIcon, ShareIcon } from '@/components/Icons'
import { generateQuote } from './ContextMenuItems'

export function NoteTargetMenu({
    target, booqId, user, setTarget
}: {
    target: NoteTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { noteId, selection, editMode } = target
    const { notes, updateNote, removeNote } = useBooqNotes({ booqId, user })
    const note = useMemo(() =>
        notes.find(n => n.id === noteId), [notes, noteId])
    const isOwnNote = user?.id === note?.author?.id
    const hasColor = HIGHLIGHT_KINDS.includes(note?.kind || 'default')
    const [editContent, setEditContent] = useState(note?.content || '')
    if (!note) {
        return null
    }

    const handleColorChange = (kind: string) => {
        updateNote({ noteId, kind })
    }

    const handleRemoveNote = () => {
        if (note) {
            removeNote({ noteId: note.id })
            setTarget({ kind: 'empty' })
        }
    }

    const handleEditNote = () => {
        setTarget({
            ...target,
            editMode: true,
        })
    }

    const handleSaveNote = () => {
        updateNote({ noteId, content: editContent })
        setTarget({
            ...target,
            editMode: false,
        })
    }

    const handleCancelEdit = () => {
        setEditContent(note.content ?? '')
        setTarget({
            ...target,
            editMode: false,
        })
    }

    const handleCopyQuote = () => {
        const quote = generateQuote(booqId, selection.text, selection.range)
        clipboard.writeText(quote)
        removeSelection()
        setTarget({ kind: 'empty' })
    }

    return (
        <div
            className="flex flex-col"
        >
            {/* Color picker - shown for own notes */}
            {isOwnNote && user && hasColor && (
                <ColorPicker
                    selectedKind={note.kind}
                    onColorChange={handleColorChange}
                />
            )}

            {/* Content container with padding */}
            <div className="px-2 py-3 gap-3 flex flex-col bg-background">
                {editMode ? (
                    /* Edit mode UI */
                    <>
                        <textarea
                            className='w-full px-3 border border-dimmed rounded bg-background text-primary text-sm leading-relaxed resize-y min-h-[80px] focus:outline-none focus:border-action mb-3'
                            style={{ fontFamily: 'var(--font-main)' }}
                            placeholder='Add a note...'
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            autoFocus
                        />
                        <div className="flex flex-row justify-end gap-4">
                            <ActionButton
                                onClick={handleSaveNote}
                                icon={<CommentIcon />}
                            >
                                Save note
                            </ActionButton>
                            <ActionButton
                                onClick={handleCancelEdit}
                                icon={<RemoveIcon />}
                            >
                                Cancel
                            </ActionButton>
                        </div>
                    </>
                ) : (
                    /* Display mode UI */
                    <>
                        {/* Note content or add note prompt */}
                        {note.content ? (
                            <div className="text-sm text-primary">
                                {note.content}
                            </div>
                        ) : (
                            <div className="text-sm">
                                <span
                                    className="cursor-pointer hover:underline text-dimmed"
                                    onClick={handleEditNote}
                                >
                                    Add note
                                </span>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-row justify-end gap-4">
                            {isOwnNote && user && note.content && (
                                <>
                                    <ActionButton
                                        onClick={handleEditNote}
                                        icon={<CommentIcon />}
                                    >
                                        Edit
                                    </ActionButton>
                                </>
                            )}
                            {isOwnNote && (<ActionButton
                                onClick={handleRemoveNote}
                                icon={<RemoveIcon />}
                            >
                                Remove
                            </ActionButton>)}
                            <ActionButton
                                onClick={handleCopyQuote}
                                icon={<ShareIcon />}
                            >
                                Copy
                            </ActionButton>
                        </div>
                        {/* Author info and date */}
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-dimmed flex items-center">
                                <Link
                                    href={userHref({ username: note.author.username })}
                                    className="flex items-center cursor-pointer hover:text-highlight transition-opacity"
                                >
                                    <ProfileBadge
                                        border={false}
                                        size={1.2}
                                        name={note.author.name}
                                        picture={note.author.profilePictureURL ?? undefined}
                                        emoji={note.author.emoji}
                                    />
                                    <span className='hover:underline'>{note.author.name}</span>
                                </Link>
                                , {note.createdAt === note.updatedAt ? 'created' : 'edited'} {formatRelativeTime(new Date(note.updatedAt))}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function removeSelection() {
    window.getSelection()?.empty()
}

function ActionButton({
    onClick,
    children,
    icon,
}: {
    onClick: () => void,
    children: React.ReactNode,
    icon: React.ReactNode,
    color?: string
}) {
    return (
        <button
            className="flex items-center gap-1 text-sm font-bold cursor-pointer text-dimmed hover:text-highlight hover:underline"
            onClick={onClick}
            onMouseDown={e => e.preventDefault()}
        >
            <div className="w-4 h-4">{icon}</div>
            {children}
        </button>
    )
}