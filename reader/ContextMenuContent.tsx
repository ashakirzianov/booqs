'use client'
import { useEffect } from 'react'
import { BooqId } from '@/core'
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
import { quoteHref } from '@/common/href'
import { NoteTargetMenu } from './NoteTargetMenu'
import { CreateCommentTargetMenu } from './CreateCommentTargetMenu'
import { AskTargetMenu } from './AskTargetMenu'
import { NoteAuthorData } from '@/data/notes'

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
    selection: BooqSelection,
}
export type CommentsListTarget = {
    kind: 'comments-list',
}
export type CommentTarget = {
    kind: 'comment',
    commentId: string,
}
export type QuestionAskedTarget = {
    kind: 'question-asked',
    commentId: string,
}
export type MenuState =
    | EmptyTarget | SelectionTarget | QuoteTarget | NoteTarget | CreateCommentTarget | AskTarget
    | CommentsListTarget | CommentTarget | QuestionAskedTarget

export function isStateDismissable(state: MenuState): boolean {
    switch (state.kind) {
        case 'empty':
        case 'selection':
        case 'ask':
        case 'comments-list':
        case 'comment':
        case 'question-asked':
            return true
        default:
            return false
    }
}

export function ContextMenuContent({
    target, booqId, user, setMenuState,
}: {
    target: MenuState,
    booqId: BooqId,
    user: NoteAuthorData | undefined,
    setMenuState: (target: MenuState) => void,
}) {
    switch (target.kind) {
        case 'selection':
            return <SelectionTargetMenu target={target} booqId={booqId} user={user} setMenuState={setMenuState} />
        case 'quote':
            return <QuoteTargetMenu target={target} booqId={booqId} user={user} setMenuState={setMenuState} />
        case 'note':
            return <NoteTargetMenu target={target} booqId={booqId} user={user} setMenuState={setMenuState} />
        case 'create-comment':
            return <CreateCommentTargetMenu target={target} booqId={booqId} user={user} setMenuState={setMenuState} />
        case 'ask':
            return <AskTargetMenu booqId={booqId} target={target} setMenuState={setMenuState} user={user} />
        default:
            return null
    }
}

function SelectionTargetMenu({
    target, booqId, user, setMenuState
}: {
    target: SelectionTarget,
    booqId: BooqId,
    user: NoteAuthorData | undefined,
    setMenuState: (target: MenuState) => void,
}) {
    const { selection } = target
    useCopyQuote(booqId, selection)
    return <>
        <AddHighlightItem booqId={booqId} user={user} setMenuState={setMenuState} selection={selection} />
        <AddCommentItem target={target} user={user} setMenuState={setMenuState} />
        <AskMenuItem target={target} user={user} setMenuState={setMenuState} />
        <CopyQuoteItem selection={selection} booqId={booqId} setMenuState={setMenuState} />
    </>
}

function QuoteTargetMenu({
    target, booqId, user, setMenuState
}: {
    target: QuoteTarget,
    booqId: BooqId,
    user: NoteAuthorData | undefined,
    setMenuState: (target: MenuState) => void,
}) {
    const { selection } = target
    return <>
        <AddHighlightItem booqId={booqId} user={user} setMenuState={setMenuState} selection={selection} />
        <AddCommentItem target={target} user={user} setMenuState={setMenuState} />
        <AskMenuItem target={target} user={user} setMenuState={setMenuState} />
        <CopyTextItem selection={selection} booqId={booqId} setMenuState={setMenuState} />
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
                    booqId, range: selection.range,
                }))
            }
        }
        window.addEventListener('copy', handleCopy)
        return () => {
            window.removeEventListener('copy', handleCopy)
        }
    }, [selection, booqId, prefetch])
}
