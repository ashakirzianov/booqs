'use client'
import { useRouter } from 'next/navigation'
import * as clipboard from 'clipboard-polyfill'
import { AuthorData, BooqId, BooqNote, BooqRange } from '@/core'
import { MenuItem } from '@/components/Menu'
import { quoteHref } from '@/core/href'
import { BooqSelection } from '@/viewer'
import { ProfileBadge } from '@/components/ProfilePicture'
import { resolveNoteColor, noteColorNames } from '@/application/common'
import { useBooqNotes } from '@/application/notes'
import { CopilotIcon, CommentIcon, CopyIcon, LinkIcon, RemoveIcon, ShareIcon } from '@/components/Icons'
import type { ContextMenuTarget, SelectionTarget, QuoteTarget, NoteTarget } from './ContextMenuContent'

export function CopilotItem({ selection, setTarget }: {
    selection: BooqSelection,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    return <MenuItem
        text='Ask copilot'
        icon={<ContextMenuIcon><CopilotIcon /></ContextMenuIcon>}
        callback={() => {
            setTarget({
                kind: 'copilot',
                selection,
                context: 'context placeholder', // Will be set properly by the consumer
            })
        }}
    />
}

export function AuthorItem({ name, pictureUrl, emoji }: {
    name?: string,
    pictureUrl?: string,
    emoji: string,
}) {
    return <div className='flex flex-1 flex-row items-center text-sm font-bold p-lg select-none' style={{ fontFamily: 'var(--font-main)' }}>
        {
            pictureUrl || emoji
                ? <div className="flex justify-center items-center mr-lg">
                    <ProfileBadge
                        border={false}
                        size={1.5}
                        name={name}
                        picture={pictureUrl}
                        emoji={emoji}
                    />
                </div>
                : null
        }
        <span className='flex flex-1'>{name}</span>
    </div>
}

export function AddHighlightItem({
    selection, booqId, user, setTarget,
}: {
    selection: BooqSelection,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { addNote } = useBooqNotes({ booqId, user })
    if (!user?.id) {
        return null
    }
    return <div className='flex flex-1 flex-row items-stretch justify-between cursor-pointer text-sm select-none'>
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
                            targetQuote: selection.text,
                        })
                        if (note) {
                            setTarget({
                                kind: 'note',
                                note: {
                                    ...note,
                                    range: selection.range,
                                },
                            })
                            removeSelection()
                        }
                    }}
                />,
            )
        }
    </div>
}

export function AddCommentItem({
    target, user, setTarget,
}: {
    target: SelectionTarget | QuoteTarget | NoteTarget,
    user: AuthorData | undefined,
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
                parent: target,
            })
        }}
    />
}

export function RemoveNoteItem({
    note, booqId, setTarget, user,
}: {
    note: BooqNote,
    booqId: BooqId,
    user: AuthorData | undefined,
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

export function SelectNoteColorItem({
    note, booqId, setTarget, user,
}: {
    note: BooqNote,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { updateNote } = useBooqNotes({ booqId, user })
    return <div className='flex flex-1 flex-row items-stretch justify-between cursor-pointer text-sm select-none'>
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
    </div>
}

export function ColorSelectionButton({ color, selected, callback }: {
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

export function CopyQuoteItem({
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

export function CopyTextItem({
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

export function CopyLinkItem({
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

function ContextMenuIcon({ children }: {
    children: React.ReactNode,
}) {
    return <div className='w-6 h-6'>{children}</div>
}

export function generateQuote(booqId: BooqId, text: string, range: BooqRange) {
    const link = generateLink(booqId, range)
    return `"${text}"\n${link}`
}

function generateLink(booqId: BooqId, range: BooqRange) {
    return `${baseUrl()}${quoteHref({ id: booqId, range })}`
}

function removeSelection() {
    window.getSelection()?.empty()
}

function baseUrl() {
    const current = window.location
    return `${current.protocol}//${current.host}`
}
