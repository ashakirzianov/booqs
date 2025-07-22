'use client'
import { useEffect, useState } from 'react'
import { AuthorData, BooqId, BooqNote, BooqMetadata } from '@/core'
import { BooqSelection } from '@/viewer'
import { CopilotContext, useCopilotAnswer, useCopilotSuggestions } from '@/application/copilot'
import { getExtraMetadataValues } from '@/core/meta'
import { ModalDivider } from '@/components/Modal'
import { Spinner } from '@/components/Icons'
import { useBooqNotes } from '@/application/notes'
import {
    CopilotItem,
    AddHighlightItem,
    AddCommentItem,
    CopyQuoteItem,
    CopyTextItem,
    CopyLinkItem,
    generateQuote,
} from './ContextMenuItems'
import { useRouter } from 'next/navigation'
import { quoteHref } from '@/core/href'
import { noteColoredKinds } from '@/application/common'
import { NoteTargetMenu } from './NoteTargetMenu'

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
    note: BooqNote,
}
export type CommentTarget = {
    kind: 'comment',
    parent: SelectionTarget | QuoteTarget | NoteTarget,
}
export type CopilotTarget = {
    kind: 'copilot',
    selection: BooqSelection,
    context: string,
}
export type ContextMenuTarget =
    | EmptyTarget | SelectionTarget | QuoteTarget | NoteTarget | CommentTarget | CopilotTarget

export function ContextMenuContent({
    target, booqMeta, booqId, user, setTarget
}: {
    target: ContextMenuTarget,
    booqId: BooqId,
    // TODO: remove this prop, put it into CopilotTarget
    booqMeta?: BooqMetadata,
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
        case 'comment':
            return <CommentTargetMenu target={target} booqId={booqId} user={user} setTarget={setTarget} />
        case 'copilot':
            return booqMeta ? <CopilotTargetMenu target={target} booqMeta={booqMeta} booqId={booqId} user={user} setTarget={setTarget} /> : null
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
        <CopilotItem selection={selection} setTarget={setTarget} />
        <CopyQuoteItem selection={selection} booqId={booqId} setTarget={setTarget} />
        <CopyLinkItem selection={selection} booqId={booqId} setTarget={setTarget} />
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
        <CopilotItem selection={selection} setTarget={setTarget} />
        <CopyTextItem selection={selection} booqId={booqId} setTarget={setTarget} />
    </>
}

function CommentTargetMenu({
    target: { parent }, booqId, user, setTarget,
}: {
    target: CommentTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const [comment, setComment] = useState('')
    const { addNote } = useBooqNotes({ booqId, user })

    // Extract selection from parent target
    const selection: BooqSelection = parent.kind === 'note'
        ? { range: parent.note.range, text: parent.note.targetQuote }
        : parent.selection

    const handlePost = () => {
        if (!user?.id || !comment.trim()) return

        const note = addNote({
            kind: noteColoredKinds[0], // Default color for comments
            range: selection.range,
            content: comment.trim(),
            privacy: 'public',
            targetQuote: selection.text,
        })

        if (note) {
            setTarget({ kind: 'empty' })
            removeSelection()
        }
    }

    const handleCancel = () => {
        setTarget(parent)
    }

    return <div className='flex flex-col gap-3 p-4 min-w-[300px] max-w-[400px]'>
        <div className='italic text-dimmed text-sm leading-relaxed border-l-[3px] border-highlight pl-3 mb-2'>
            &ldquo;{selection.text}&rdquo;
        </div>
        <textarea
            className='w-full px-3 py-2 border border-dimmed rounded bg-background text-primary text-sm leading-relaxed resize-y min-h-[80px] focus:outline-none focus:border-action'
            style={{ fontFamily: 'var(--font-main)' }}
            placeholder='Add a comment...'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            autoFocus
        />
        <div className='flex gap-2 justify-end'>
            <button
                className='px-4 py-2 border-none rounded text-sm cursor-pointer transition-opacity bg-transparent text-dimmed hover:opacity-80'
                style={{ fontFamily: 'var(--font-main)' }}
                onClick={handleCancel}
            >
                Cancel
            </button>
            <button
                className='px-4 py-2 border-none rounded text-sm cursor-pointer transition-opacity bg-action text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                style={{ fontFamily: 'var(--font-main)' }}
                onClick={handlePost}
                disabled={!comment.trim()}
            >
                Post
            </button>
        </div>
    </div>
}

function CopilotTargetMenu({
    target, booqId, booqMeta, setTarget,
}: {
    target: CopilotTarget,
    booqId: BooqId,
    booqMeta: BooqMetadata,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { selection, context } = target

    const copilotContext: CopilotContext = {
        text: selection.text,
        context: context,
        booqId: booqId,
        title: booqMeta.title ?? 'Unknown',
        author: booqMeta.authors?.join(', ') ?? 'Unknown author',
        language: getExtraMetadataValues('language', booqMeta.extra)[0] ?? 'en-US',
        start: selection.range.start,
        end: selection.range.end,
    }

    const { loading, suggestions } = useCopilotSuggestions(copilotContext)
    const [question, setQuestion] = useState<string | undefined>(undefined)

    if (question) {
        return <CopilotQuestion
            context={copilotContext}
            question={question}
            onBack={() => setQuestion(undefined)}
            onClose={() => setTarget({ kind: 'empty' })}
        />
    }

    return <div className='flex flex-col gap-3 p-4 min-w-[300px] max-w-[400px]' style={{ fontFamily: 'var(--font-main)' }}>
        <div className='italic text-dimmed text-sm leading-relaxed border-l-[3px] border-highlight pl-3 mb-2'>
            &ldquo;{selection.text}&rdquo;
        </div>
        {loading ? (
            <div className='flex justify-center p-5'>
                <Spinner />
            </div>
        ) : (
            <div className='flex flex-col'>
                {suggestions.map((suggestion, i) => (
                    <div key={i}>
                        <div
                            className='flex cursor-pointer text-dimmed text-base font-bold p-3 transition-all duration-200 hover:underline hover:text-highlight'
                            onClick={() => setQuestion(suggestion)}
                        >
                            {`${i + 1}. ${suggestion}`}
                        </div>
                        {i < suggestions.length - 1 && <ModalDivider />}
                    </div>
                ))}
            </div>
        )}
    </div>
}

function CopilotQuestion({
    context,
    question,
    onBack,
    onClose
}: {
    context: CopilotContext,
    question: string,
    onBack: () => void,
    onClose: () => void,
}) {
    const { loading, answer } = useCopilotAnswer(context, question)

    return <div className='flex flex-col gap-3 p-4 min-w-[300px] max-w-[400px]' style={{ fontFamily: 'var(--font-main)' }}>
        <div className='flex justify-between items-center'>
            <button
                className='bg-transparent border-none text-dimmed cursor-pointer text-sm px-2 py-1 transition-colors duration-200 hover:text-primary'
                onClick={onBack}
            >
                ← Back
            </button>
            <button
                className='bg-transparent border-none text-dimmed cursor-pointer text-lg font-bold px-2 py-1 transition-colors duration-200 hover:text-primary'
                onClick={onClose}
            >
                ×
            </button>
        </div>
        <div className='text-sm leading-relaxed text-primary'>
            <strong>Q: {question}</strong>
        </div>
        <ModalDivider />
        <div className='flex-1'>
            {loading ? (
                <div className='flex justify-center p-5'>
                    <Spinner />
                </div>
            ) : (
                <div className='text-sm leading-relaxed text-primary whitespace-pre-wrap'>
                    {answer}
                </div>
            )}
        </div>
    </div>
}

function removeSelection() {
    window.getSelection()?.empty()
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
