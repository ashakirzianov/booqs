'use client'
import { useEffect } from 'react'
import { AuthorData, BooqId } from '@/core'
import { BooqSelection } from '@/viewer'
import {
    AddHighlightItem,
    AddCommentItem,
    CopyQuoteItem,
    CopyTextItem,
    generateQuote,
    AskMenuItem,
} from './ContextMenuItems'
import { useRouter } from 'next/navigation'
import { quoteHref } from '@/core/href'
import { NoteTargetMenu } from './NoteTargetMenu'
import { CreateCommentTargetMenu } from './CreateCommentTargetMenu'
import { AskTargetMenu } from './AskTargetMenu'

type EmptyTarget = {
    kind: 'empty',
}
export type SelectionTarget = {
    kind: 'selection',
    selection: BooqSelection,
}
export type QuoteTarget = {
    kind: 'quote',
    selection: BooqSelection,
}
export type NoteTarget = {
    kind: 'note',
    noteId: string,
    selection: BooqSelection,
    editMode?: boolean,
}
export type CreateCommentTarget = {
    kind: 'create-comment',
    parent: SelectionTarget | QuoteTarget | NoteTarget,
}
export type AskTarget = {
    kind: 'ask',
    question: string | undefined,
    selection: BooqSelection,
    hidden?: boolean,
}
export type ContextMenuTarget =
    | EmptyTarget | SelectionTarget | QuoteTarget | NoteTarget | CreateCommentTarget | AskTarget

export function ContextMenuContent({
    target, booqId, user, setTarget
}: {
    target: ContextMenuTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    switch (target.kind) {
        case 'selection':
            return <SelectionTargetMenu target={target} booqId={booqId} user={user} setTarget={setTarget} />
        case 'quote':
            return <QuoteTargetMenu target={target} booqId={booqId} user={user} setTarget={setTarget} />
        case 'note':
            return <NoteTargetMenu target={target} booqId={booqId} user={user} setTarget={setTarget} />
        case 'create-comment':
            return <CreateCommentTargetMenu target={target} booqId={booqId} user={user} setTarget={setTarget} />
        case 'ask':
            return <AskTargetMenu booqId={booqId} target={target} setTarget={setTarget} />
        default:
            return null
    }
}

function SelectionTargetMenu({
    target, booqId, user, setTarget
}: {
    target: SelectionTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { selection } = target
    useCopyQuote(booqId, selection)
    return <>
        <AddHighlightItem booqId={booqId} user={user} setTarget={setTarget} selection={selection} />
        <AddCommentItem target={target} user={user} setTarget={setTarget} />
        <AskMenuItem target={target} user={user} setTarget={setTarget} />
        <CopyQuoteItem selection={selection} booqId={booqId} setTarget={setTarget} />
    </>
}

function QuoteTargetMenu({
    target, booqId, user, setTarget
}: {
    target: QuoteTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { selection } = target
    return <>
        <AddHighlightItem booqId={booqId} user={user} setTarget={setTarget} selection={selection} />
        <AddCommentItem target={target} user={user} setTarget={setTarget} />
        <AskMenuItem target={target} user={user} setTarget={setTarget} />
        <CopyTextItem selection={selection} booqId={booqId} setTarget={setTarget} />
    </>
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
