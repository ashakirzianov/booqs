import Link from 'next/link'
import { useMemo, useState } from 'react'
import * as clipboard from 'clipboard-polyfill'
import { BooqId } from '@/core'
import type { MenuState, NoteTarget } from './ContextMenuContent'
import { ColorPicker } from '@/components/ColorPicker'
import { formatRelativeTime } from '@/application/common'
import { HIGHLIGHT_KINDS, useBooqNotes } from '@/application/notes'
import { ProfileBadge } from '@/components/ProfilePicture'
import { CommentIcon, RemoveIcon, QuestionMarkIcon, ShareIcon } from '@/components/Icons'
import { NoteReplies } from './NoteReplies'
import { generateQuote } from './ContextMenuItems'
import { NoteAuthorData } from '@/data/notes'
import { userHref } from '@/common/href'
import { MenuButton } from './MenuButton'

export function NoteTargetMenu({
    target, booqId, user, setMenuState
}: {
    target: NoteTarget,
    booqId: BooqId,
    user: NoteAuthorData | undefined,
    setMenuState: (target: MenuState) => void,
}) {
    const { noteId, editMode } = target
    const { notes, updateNote, removeNote } = useBooqNotes({ booqId, user })
    const note = useMemo(() =>
        notes.find(n => n.id === noteId), [notes, noteId])
    const isOwnNote = user?.id === note?.author?.id
    const isAuthenticated = !!user?.id
    const hasColor = HIGHLIGHT_KINDS.includes(note?.kind || 'default')
    const [editContent, setEditContent] = useState(note?.content || null)
    if (!note) {
        return null
    }

    const handleColorChange = (kind: string) => {
        updateNote({ noteId, kind })
    }

    const handleRemoveNote = () => {
        if (note) {
            removeNote({ noteId: note.id })
            setMenuState({ kind: 'empty' })
        }
    }

    const handleEditNote = () => {
        setMenuState({
            ...target,
            editMode: true,
        })
    }

    const handleSaveNote = () => {
        updateNote({ noteId, content: editContent })
        setMenuState({
            ...target,
            editMode: false,
        })
    }

    const handleCancelEdit = () => {
        setEditContent(note.content ?? '')
        setMenuState({
            ...target,
            editMode: false,
        })
    }

    const handleAskQuestion = () => {
        setMenuState({
            kind: 'ask',
            selection: target.selection,
        })
    }

    const handleShareNote = () => {
        const quote = generateQuote(booqId, target.selection.text, target.selection.range)
        clipboard.writeText(quote)
        setMenuState({ kind: 'empty' })
    }

    return (
        <div
            className="flex flex-col"
        >
            {/* Color picker - shown for own notes */}
            {isOwnNote && isAuthenticated && hasColor && (
                <div className='h-10'>
                    <ColorPicker
                        selectedKind={note.kind}
                        onColorChange={handleColorChange}
                    />
                </div>
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
                            value={editContent ?? ''}
                            onChange={(e) => setEditContent(e.target.value || null)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault()
                                    handleSaveNote()
                                }
                            }}
                            rows={3}
                            autoFocus
                        />
                        <div className="flex flex-row justify-start gap-4">
                            <MenuButton
                                onClick={handleSaveNote}
                            >
                                <div className="w-4 h-4"><CommentIcon /></div>
                                Save note
                            </MenuButton>
                            <MenuButton
                                onClick={handleCancelEdit}
                            >
                                <div className="w-4 h-4"><RemoveIcon /></div>
                                Cancel
                            </MenuButton>
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
                        <div className="flex flex-row flex-wrap justify-start gap-4">
                            {isOwnNote && note.content && (
                                <MenuButton
                                    onClick={handleEditNote}
                                >
                                    <div className="w-4 h-4"><CommentIcon /></div>
                                    Edit
                                </MenuButton>
                            )}
                            {isAuthenticated && (
                                <MenuButton
                                    onClick={handleAskQuestion}
                                >
                                    <div className="w-4 h-4"><QuestionMarkIcon /></div>
                                    Ask
                                </MenuButton>
                            )}
                            <MenuButton
                                onClick={handleShareNote}
                            >
                                <div className="w-4 h-4"><ShareIcon /></div>
                                Share
                            </MenuButton>
                            {isOwnNote && (
                                <MenuButton
                                    onClick={handleRemoveNote}
                                >
                                    <div className="w-4 h-4"><RemoveIcon /></div>
                                    Remove
                                </MenuButton>
                            )}
                        </div>

                        {/* Replies - shown for public comments */}
                        {note.privacy === 'public' && note.kind === 'comment' && (
                            <NoteReplies noteId={note.id} user={user} />
                        )}

                        {/* Author info and date */}
                        {!isOwnNote && (<span className="text-xs text-dimmed flex flex-row items-center justify-start flex-wrap">
                            <Link
                                href={userHref({ username: note.author.username })}
                                className="flex justify-start cursor-pointer hover:text-highlight transition-opacity gap-0 min-w-0 max-w-[140px]"
                            >
                                <ProfileBadge
                                    border={false}
                                    size={1}
                                    name={note.author.name}
                                    picture={note.author.profilePictureURL ?? undefined}
                                    emoji={note.author.emoji}
                                />
                                <span className='hover:underline truncate' title={note.author.name}>{note.author.name}</span>
                            </Link>&nbsp;
                            <span className="whitespace-nowrap">{note.createdAt === note.updatedAt ? 'created' : 'edited'} {formatRelativeTime(new Date(note.updatedAt))}</span>
                        </span>)}
                    </>
                )}
            </div>
        </div>
    )
}

