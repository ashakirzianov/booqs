import Link from 'next/link'
import * as clipboard from 'clipboard-polyfill'
import { AuthorData, BooqId, userHref } from '@/core'
import type { ContextMenuTarget, NoteTarget } from './ContextMenuContent'
import { ColorPicker } from './ColorPicker'
import { resolveNoteColor, noteColoredKinds, formatRelativeTime } from '@/application/common'
import { useBooqNotes } from '@/application/notes'
import { ProfileBadge } from '@/components/ProfilePicture'
import { CommentIcon, RemoveIcon, ShareIcon } from '@/components/Icons'
import { generateQuote } from './ContextMenuItems'


function removeSelection() {
    window.getSelection()?.empty()
}

function ActionButton({
    onClick,
    children,
    icon
}: {
    onClick: () => void,
    children: React.ReactNode,
    icon: React.ReactNode
}) {
    return (
        <button
            className="flex items-center gap-1 text-sm font-bold cursor-pointer text-primary hover:underline"
            onClick={onClick}
            onMouseDown={e => e.preventDefault()}
        >
            <div className="w-4 h-4">{icon}</div>
            {children}
        </button>
    )
}

export function NoteTargetMenu({
    target, booqId, user, setTarget
}: {
    target: NoteTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { note } = target
    const isOwnNote = user?.id === note.author?.id
    const { updateNote, removeNote } = useBooqNotes({ booqId, user })
    const noteColor = resolveNoteColor(note.kind)
    const hasColor = noteColoredKinds.includes(note.kind)

    const selection = {
        range: note.range,
        text: note.targetQuote,
    }

    const handleColorChange = (kind: string) => {
        updateNote({ noteId: note.id, kind })
        setTarget({
            kind: 'note',
            note: {
                ...note,
                kind,
            },
        })
    }

    const handleRemoveNote = () => {
        removeNote({ noteId: note.id })
        setTarget({ kind: 'empty' })
    }

    const handleAddComment = () => {
        setTarget({
            kind: 'comment',
            parent: target,
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
            style={{
                backgroundColor: hasColor ? noteColor : 'var(--color-background)'
            }}
        >
            {/* Color picker - shown for own notes */}
            {isOwnNote && user && (
                <ColorPicker
                    selectedKind={note.kind}
                    onColorChange={handleColorChange}
                />
            )}

            {/* Content container with padding */}
            <div className="p-2 flex flex-col">
                {/* Note content */}
                {note.content && (
                    <div className="mb-3 text-sm text-primary">
                        {note.content}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-row gap-4">
                    {isOwnNote && user && (
                        <>
                            <ActionButton
                                onClick={handleAddComment}
                                icon={<CommentIcon />}
                            >
                                {note.content ? 'Edit' : 'Add note'}
                            </ActionButton>
                            <ActionButton
                                onClick={handleRemoveNote}
                                icon={<RemoveIcon />}
                            >
                                Remove
                            </ActionButton>
                        </>
                    )}
                    <ActionButton
                        onClick={handleCopyQuote}
                        icon={<ShareIcon />}
                    >
                        Copy
                    </ActionButton>
                </div>

                {/* Author info and date */}
                <div className="flex items-center justify-end gap-2 mt-3">
                    <span className="text-xs text-dimmed flex items-center">
                        <Link
                            href={userHref({ username: note.author.username })}
                            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
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
            </div>
        </div>
    )
}