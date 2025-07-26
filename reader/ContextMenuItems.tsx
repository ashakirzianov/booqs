'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as clipboard from 'clipboard-polyfill'
import { BooqId, BooqRange } from '@/core'
import { MenuItem } from '@/components/Menu'
import { quoteHref, userHref } from '@/common/href'
import { BooqSelection } from '@/viewer'
import { ProfileBadge } from '@/components/ProfilePicture'
import { ColorPicker } from './ColorPicker'
import { useBooqNotes } from '@/application/notes'
import { CommentIcon, CopyIcon, LinkIcon, RemoveIcon, ShareIcon, QuestionMarkIcon } from '@/components/Icons'
import type { ContextMenuTarget, SelectionTarget, QuoteTarget, NoteTarget } from './ContextMenuContent'
import { BooqNote, NoteAuthorData } from '@/data/notes'

export function AuthorItem({ name, pictureUrl, emoji, username }: {
    name: string,
    pictureUrl?: string,
    emoji: string,
    username: string,
}) {
    return (
        <Link
            href={userHref({ username })}
            className='flex flex-1 flex-row items-center text-sm font-bold p-lg select-none hover:bg-gray-50 transition-colors rounded'
            style={{ fontFamily: 'var(--font-main)' }}
        >
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
        </Link>
    )
}

export function AddHighlightItem({
    selection, booqId, user, setTarget,
}: {
    selection: BooqSelection,
    booqId: BooqId,
    user: NoteAuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { addNote } = useBooqNotes({ booqId, user })
    if (!user?.id) {
        return null
    }

    const handleColorChange = (kind: string) => {
        const note = addNote({
            kind,
            range: selection.range,
            targetQuote: selection.text,
        })
        if (note) {
            setTarget({
                kind: 'note',
                noteId: note.id,
                selection: selection,
            })
            window.getSelection()?.empty()
        }
    }

    return (
        <ColorPicker
            selectedKind=""
            onColorChange={handleColorChange}
        />
    )
}

export function AddCommentItem({
    target, user, setTarget,
}: {
    target: SelectionTarget | QuoteTarget | NoteTarget,
    user: NoteAuthorData | undefined,
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
                kind: 'create-comment',
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
    user: NoteAuthorData | undefined,
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

export function AskMenuItem({
    target, user, setTarget,
}: {
    target: SelectionTarget | QuoteTarget,
    user: NoteAuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    if (!user?.id) {
        return null
    }
    return <MenuItem
        text='Ask question'
        icon={<ContextMenuIcon><QuestionMarkIcon /></ContextMenuIcon>}
        callback={() => {
            setTarget({
                kind: 'ask',
                question: undefined,
                selection: target.selection,
            })
        }}
    />
}

function baseUrl() {
    const current = window.location
    return `${current.protocol}//${current.host}`
}
