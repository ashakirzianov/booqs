import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AuthorData, BooqId, userHref } from '@/core'
import type { ContextMenuTarget, NoteTarget } from './ContextMenuContent'
import { ColorPicker } from './ColorPicker'
import { formatRelativeTime } from '@/application/common'
import { HIGHLIGHT_KINDS, useBooqNotes } from '@/application/notes'
import { ProfileBadge } from '@/components/ProfilePicture'
import { CommentIcon, RemoveIcon } from '@/components/Icons'

export function NoteTargetMenu({
    target, booqId, user, setTarget
}: {
    target: NoteTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { noteId, editMode } = target
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
            <div className="px-3 py-3 gap-3 flex flex-col bg-background">
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
                        <div className="flex flex-row justify-start gap-4">
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
                        ) : (isOwnNote && (
                            <div className="text-sm">
                                <span
                                    className="cursor-pointer hover:underline text-dimmed"
                                    onClick={handleEditNote}
                                >
                                    Add note
                                </span>
                            </div>
                        ))}

                        {/* Action buttons */}
                        {isOwnNote && (<div className="flex flex-row justify-start gap-4">
                            {note.content && (
                                <>
                                    <ActionButton
                                        onClick={handleEditNote}
                                        icon={<CommentIcon />}
                                    >
                                        Edit
                                    </ActionButton>
                                </>
                            )}<ActionButton
                                onClick={handleRemoveNote}
                                icon={<RemoveIcon />}
                            >
                                Remove
                            </ActionButton>
                        </div>)}

                        {/* Author info and date */}
                        {!isOwnNote && (<span className="text-xs text-dimmed flex flex-row items-center justify-start flex-wrap">
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
                                />&nbsp;
                                <span className='hover:underline'>{note.author.name}</span>
                            </Link>&nbsp;
                            <span>{note.createdAt === note.updatedAt ? 'created' : 'edited'} {formatRelativeTime(new Date(note.updatedAt))}</span>
                        </span>)}
                    </>
                )}
            </div>
        </div>
    )
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