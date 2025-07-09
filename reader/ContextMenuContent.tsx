'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as clipboard from 'clipboard-polyfill'
import { AccountDisplayData, BooqId, BooqNote, BooqRange } from '@/core'
import { MenuItem } from '@/components/Menu'
import { quoteHref } from '@/application/href'
import { BooqSelection } from '@/viewer'
import { ProfileBadge } from '@/components/ProfilePicture'
import { resolveNoteColor, noteColorNames } from '@/application/common'
import { useBooqNotes } from '@/application/notes'
import { CopilotIcon, CommentIcon, CopyIcon, LinkIcon, RemoveIcon, ShareIcon } from '@/components/Icons'

type EmptyTarget = {
    kind: 'empty',
}
type SelectionTarget = {
    kind: 'selection',
    selection: BooqSelection,
}
type QuoteTarget = {
    kind: 'quote',
    selection: BooqSelection,
}
type NoteTarget = {
    kind: 'note',
    note: BooqNote,
}
type CommentTarget = {
    kind: 'comment',
    selection: BooqSelection,
}
export type ContextMenuTarget =
    | EmptyTarget | SelectionTarget | QuoteTarget | NoteTarget | CommentTarget

export function ContextMenuContent({
    target, ...rest
}: {
    target: ContextMenuTarget,
    booqId: BooqId,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
    updateCopilot?: (selection: BooqSelection) => void,
}) {
    switch (target.kind) {
        case 'selection':
            return <SelectionTargetMenu target={target} {...rest} />
        case 'quote':
            return <QuoteTargetMenu target={target} {...rest} />
        case 'note':
            return <NoteTargetMenu target={target} {...rest} />
        case 'comment':
            return <CommentTargetMenu target={target} {...rest} />
        default:
            return null
    }
}

function SelectionTargetMenu({
    target: { selection }, ...rest
}: {
    target: SelectionTarget,
    booqId: BooqId,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
    updateCopilot?: (selection: BooqSelection) => void,
}) {
    useCopyQuote(rest.booqId, selection)
    return <>
        <AddHighlightItem {...rest} selection={selection} />
        <AddCommentItem user={rest.user} setTarget={rest.setTarget} selection={selection} />
        <CopilotItem {...rest} selection={selection} />
        <CopyQuoteItem {...rest} selection={selection} />
        <CopyLinkItem {...rest} selection={selection} />
    </>
}

function QuoteTargetMenu({
    target: { selection }, ...rest
}: {
    target: QuoteTarget,
    booqId: BooqId,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
    updateCopilot?: (selection: BooqSelection) => void,
}) {
    return <>
        <AddHighlightItem {...rest} selection={selection} />
        <CopilotItem {...rest} selection={selection} />
        <CopyTextItem {...rest} selection={selection} />
    </>
}

function NoteTargetMenu({
    target: { note }, user, ...rest
}: {
    target: NoteTarget,
    booqId: BooqId,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
    updateCopilot?: (selection: BooqSelection) => void,
}) {
    const isOwnNote = user?.id === note.author?.id
    const selection = {
        range: note.range,
        text: note.text,
    }
    return <>
        {isOwnNote ? null :
            <AuthorItem
                name={note.author.name ?? undefined}
                pictureUrl={note.author.profilePictureURL ?? undefined}
            />
        }
        {!isOwnNote ? null :
            <SelectNoteColorItem  {...rest} user={user} note={note} />
        }
        {!isOwnNote ? null :
            <RemoveNoteItem  {...rest} user={user} note={note} />
        }
        <CopilotItem {...rest} selection={selection} />
        <CopyQuoteItem {...rest} selection={selection} />
        <CopyLinkItem {...rest} selection={selection} />
    </>
}

function CopilotItem({ selection, updateCopilot }: {
    selection: BooqSelection,
    updateCopilot?: (selection: BooqSelection) => void,
}) {
    if (updateCopilot === undefined) {
        return null
    }
    return <MenuItem
        text='Ask copilot'
        icon={<ContextMenuIcon><CopilotIcon /></ContextMenuIcon>}
        callback={() => {
            updateCopilot(selection)
        }}
    />
}

function AuthorItem({ name, pictureUrl }: {
    name?: string,
    pictureUrl?: string,
}) {
    return <div className='container font-bold p-lg'>
        {
            pictureUrl
                ? <div className="picture mr-lg">
                    <ProfileBadge
                        border={false}
                        size={1.5}
                        name={name}
                        picture={pictureUrl}
                    />
                </div>
                : null
        }
        <span className='name'>{name ?? 'Incognito'}</span>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: center;
                font-size: smaller;
                font-family: var(--font-main);
                user-select: none;
            }
            .picture {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .name {
                display: flex;
                flex: 1;
            }
            `}</style>
    </div>
}

function AddHighlightItem({
    selection, booqId, user, setTarget,
}: {
    selection: BooqSelection,
    booqId: BooqId,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { addNote } = useBooqNotes({ booqId, user })
    if (!user?.id) {
        return null
    }
    return <div className='container'>
        {
            noteColorNames.map(
                (color, idx) => <ColorSelectionButton
                    key={idx}
                    selected={false}
                    color={resolveNoteColor(color)}
                    callback={() => {
                        const note = addNote({
                            color,
                            range: selection.range,
                        })
                        if (note) {
                            setTarget({
                                kind: 'note',
                                note: {
                                    ...note,
                                    text: selection.text,
                                    range: selection.range,
                                },
                            })
                            removeSelection()
                        }
                    }}
                />,
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: stretch;
                justify-content: space-between;
                cursor: pointer;
                font-size: small;
                user-select: none;
            }
            `}</style>
    </div>
}

function AddCommentItem({
    selection, user, setTarget,
}: {
    selection: BooqSelection,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    if (!user?.id) {
        return null
    }
    return <MenuItem
        text='Add comment'
        icon={<ContextMenuIcon><CommentIcon /></ContextMenuIcon>}
        callback={() => {
            setTarget({
                kind: 'comment',
                selection,
            })
        }}
    />
}

function RemoveNoteItem({
    note, booqId, setTarget, user,
}: {
    note: BooqNote,
    booqId: BooqId,
    user: AccountDisplayData,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { removeNote } = useBooqNotes({ booqId, user })
    return <MenuItem
        text='Remove'
        icon={<ContextMenuIcon><RemoveIcon /></ContextMenuIcon>}
        callback={() => {
            removeNote({ noteId: note.id })
            setTarget({ kind: 'empty' })
        }}
    />
}

function SelectNoteColorItem({
    note, booqId, setTarget, user,
}: {
    note: BooqNote,
    booqId: BooqId,
    user: AccountDisplayData,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { updateNote } = useBooqNotes({ booqId, user })
    return <div className='container'>
        {
            noteColorNames.map(
                (color, idx) => <ColorSelectionButton
                    key={idx}
                    selected={color === note.color}
                    color={resolveNoteColor(color)}
                    callback={() => {
                        updateNote({ noteId: note.id, color })
                        // Note: hackie way of updating selection
                        setTarget({
                            kind: 'note',
                            note: {
                                ...note,
                                color,
                            },
                        })
                    }}
                />,
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: stretch;
                justify-content: space-between;
                cursor: pointer;
                font-size: small;
                user-select: none;
            }
            `}</style>
    </div>
}

function ColorSelectionButton({ color, selected, callback }: {
    selected: boolean,
    color: string,
    callback: () => void,
}) {
    return <div
        // Note: prevent loosing selection on safari
        onMouseDown={e => e.preventDefault()}
        onClick={callback} className='flex flex-1 self-stretch text-transparent cursor-pointer h-10 transition-all' style={{
            background: color,
            borderBottom: `0.5rem solid ${selected ? `${color}` : `rgba(0,0,0,0)`}`,
        }}>
    </div>
}

function CopyQuoteItem({
    selection, booqId, setTarget,
}: {
    selection: BooqSelection,
    booqId: BooqId,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { prefetch } = useRouter()
    return <MenuItem
        text='Copy quote'
        icon={<ContextMenuIcon><ShareIcon /></ContextMenuIcon>}
        callback={() => {
            const quote = generateQuote(booqId, selection.text, selection.range)
            clipboard.writeText(quote)
            removeSelection()
            prefetch(quoteHref({
                id: booqId, range: selection.range,
            }))
            setTarget({ kind: 'empty' })
        }}
    />
}

function CopyTextItem({
    selection, setTarget,
}: {
    selection: BooqSelection,
    booqId: BooqId,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    return <MenuItem
        text='Copy text'
        icon={<ContextMenuIcon><CopyIcon /></ContextMenuIcon>}
        callback={() => {
            const text = selection.text
            clipboard.writeText(text)
            removeSelection()
            setTarget({ kind: 'empty' })
        }}
    />
}

function CopyLinkItem({
    selection, booqId, setTarget,
}: {
    selection: BooqSelection,
    booqId: BooqId,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { prefetch } = useRouter()
    return <MenuItem
        text='Copy link'
        icon={<ContextMenuIcon><LinkIcon /></ContextMenuIcon>}
        callback={() => {
            const link = generateLink(booqId, selection.range)
            clipboard.writeText(link)
            removeSelection()
            prefetch(quoteHref({
                id: booqId, range: selection.range,
            }))
            setTarget({ kind: 'empty' })
        }}
    />
}

function useCopyQuote(booqId: BooqId, selection?: BooqSelection) {
    const { prefetch } = useRouter()
    useEffect(() => {
        function handleCopy(e: ClipboardEvent) {
            if (selection && e.clipboardData) {
                e.preventDefault()
                const selectionText = generateQuote(booqId, selection.text, selection.range)
                e.clipboardData.setData('text/plain', selectionText)
                prefetch(quoteHref({
                    id: booqId, range: selection.range,
                }))
            }
        }
        window.addEventListener('copy', handleCopy)
        return () => {
            window.removeEventListener('copy', handleCopy)
        }
    }, [selection, booqId, prefetch])
}

function removeSelection() {
    window.getSelection()?.empty()
}

function generateQuote(booqId: BooqId, text: string, range: BooqRange) {
    const link = generateLink(booqId, range)
    return `"${text}"\n${link}`
}

function generateLink(booqId: BooqId, range: BooqRange) {
    return `${baseUrl()}${quoteHref({ id: booqId, range })}`
}

function baseUrl() {
    const current = window.location
    return `${current.protocol}//${current.host}`
}

function CommentTargetMenu({
    target: { selection }, booqId, user, setTarget,
}: {
    target: CommentTarget,
    booqId: BooqId,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
    updateCopilot?: (selection: BooqSelection) => void,
}) {
    const [comment, setComment] = useState('')
    const { addNote } = useBooqNotes({ booqId, user })

    const handlePost = () => {
        if (!user?.id || !comment.trim()) return

        const note = addNote({
            color: 'yellow', // Default color for comments
            range: selection.range,
            content: comment.trim(),
            privacy: 'public',
        })

        if (note) {
            setTarget({ kind: 'empty' })
            removeSelection()
        }
    }

    const handleCancel = () => {
        setTarget({ kind: 'empty' })
        removeSelection()
    }

    return <div className='comment-panel'>
        <div className='quoted-text'>
            "{selection.text}"
        </div>
        <textarea
            className='comment-input'
            placeholder='Add a comment...'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            autoFocus
        />
        <div className='button-row'>
            <button
                className='cancel-button'
                onClick={handleCancel}
            >
                Cancel
            </button>
            <button
                className='post-button'
                onClick={handlePost}
                disabled={!comment.trim()}
            >
                Post
            </button>
        </div>
        <style jsx>{`
            .comment-panel {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 16px;
                min-width: 300px;
                max-width: 400px;
            }
            .quoted-text {
                font-style: italic;
                color: var(--theme-dimmed);
                font-size: 14px;
                line-height: 1.4;
                border-left: 3px solid var(--theme-highlight);
                padding-left: 12px;
                margin-bottom: 8px;
            }
            .comment-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--theme-border);
                border-radius: 4px;
                font-family: var(--font-main);
                font-size: 14px;
                line-height: 1.4;
                resize: vertical;
                min-height: 80px;
                background: var(--theme-background);
                color: var(--theme-primary);
            }
            .comment-input:focus {
                outline: none;
                border-color: var(--theme-action);
            }
            .button-row {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }
            .cancel-button, .post-button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                font-family: var(--font-main);
                font-size: 14px;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            .cancel-button {
                background: transparent;
                color: var(--theme-dimmed);
            }
            .cancel-button:hover {
                opacity: 0.8;
            }
            .post-button {
                background: var(--theme-action);
                color: var(--theme-background);
            }
            .post-button:hover:not(:disabled) {
                opacity: 0.9;
            }
            .post-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `}</style>
    </div>
}

function ContextMenuIcon({ children }: {
    children: React.ReactNode,
}) {
    return <div className='w-6 h-6'>{children}</div>
}
