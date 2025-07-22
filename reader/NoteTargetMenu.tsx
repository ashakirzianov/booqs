import Link from 'next/link'
import * as clipboard from 'clipboard-polyfill'
import { AuthorData, BooqId, userHref } from '@/core'
import type { ContextMenuTarget, NoteTarget } from './ContextMenuContent'
import { ColorSelectionButton } from './ContextMenuItems'
import { resolveNoteColor, noteColoredKinds, formatRelativeTime } from '@/application/common'
import { useBooqNotes } from '@/application/notes'
import { ProfileBadge } from '@/components/ProfilePicture'
import { CommentIcon, RemoveIcon, ShareIcon } from '@/components/Icons'
import { generateQuote } from './ContextMenuItems'


function removeSelection() {
    window.getSelection()?.empty()
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
                <div className="flex flex-row items-stretch justify-between">
                    {noteColoredKinds.map((kind, idx) => (
                        <ColorSelectionButton
                            key={idx}
                            selected={kind === note.kind}
                            color={resolveNoteColor(kind)}
                            callback={() => handleColorChange(kind)}
                        />
                    ))}
                </div>
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
                <div className="flex flex-row gap-2 mb-3">
                    {isOwnNote && user && (
                        <>
                            <button
                                className="flex items-center gap-2 px-3 py-2 text-sm font-bold cursor-pointer hover:bg-black/10 rounded transition-colors"
                                onClick={handleAddComment}
                                onMouseDown={e => e.preventDefault()}
                            >
                                <div className="w-4 h-4"><CommentIcon /></div>
                                {note.content ? 'Edit' : 'Add note'}
                            </button>
                            <button
                                className="flex items-center gap-2 px-3 py-2 text-sm font-bold cursor-pointer hover:bg-black/10 rounded transition-colors"
                                onClick={handleRemoveNote}
                                onMouseDown={e => e.preventDefault()}
                            >
                                <div className="w-4 h-4"><RemoveIcon /></div>
                                Remove note
                            </button>
                        </>
                    )}
                    <button
                        className="flex items-center gap-2 px-3 py-2 text-sm font-bold cursor-pointer hover:bg-black/10 rounded transition-colors"
                        onClick={handleCopyQuote}
                        onMouseDown={e => e.preventDefault()}
                    >
                        <div className="w-4 h-4"><ShareIcon /></div>
                        Copy quote
                    </button>
                </div>

                {/* Author info and date */}
                <div className="flex items-center gap-2">
                    <Link
                        href={userHref({ username: note.author.username })}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <ProfileBadge
                            border={false}
                            size={1.2}
                            name={note.author.name}
                            picture={note.author.profilePictureURL ?? undefined}
                            emoji={note.author.emoji}
                        />
                        <span className="text-xs text-dimmed">{note.author.name}</span>
                    </Link>
                    <span className="text-xs text-dimmed ml-auto">
                        {formatRelativeTime(new Date(note.createdAt))}
                    </span>
                </div>
            </div>
        </div>
    )
}