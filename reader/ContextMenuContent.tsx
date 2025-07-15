'use client'
import { useEffect, useState } from 'react'
import { AccountDisplayData, BooqId, BooqNote, BooqMetadata } from '@/core'
import { BooqSelection } from '@/viewer'
import { CopilotContext, useCopilotAnswer, useCopilotSuggestions } from '@/application/copilot'
import { getExtraMetadataValues } from '@/core/meta'
import { ModalDivider } from '@/components/Modal'
import { Spinner } from '@/components/Icons'
import { useBooqNotes } from '@/application/notes'
import {
    CopilotItem,
    AuthorItem,
    AddHighlightItem,
    AddCommentItem,
    RemoveNoteItem,
    SelectNoteColorItem,
    CopyQuoteItem,
    CopyTextItem,
    CopyLinkItem,
    generateQuote,
} from './ContextMenuItems'
import { useRouter } from 'next/navigation'
import { quoteHref } from '@/core/href'
import { noteColorNames } from '@/application/common'

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
    user: AccountDisplayData | undefined,
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
    user: AccountDisplayData | undefined,
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
    user: AccountDisplayData | undefined,
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

function NoteTargetMenu({
    target, booqId, user, setTarget
}: {
    target: NoteTarget,
    booqId: BooqId,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { note } = target
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
                emoji={note.author.emoji}
            />
        }
        {!isOwnNote || !user ? null :
            <SelectNoteColorItem booqId={booqId} user={user} setTarget={setTarget} note={note} />
        }
        {!isOwnNote || !user ? null :
            <RemoveNoteItem booqId={booqId} user={user} setTarget={setTarget} note={note} />
        }
        <AddCommentItem target={target} user={user} setTarget={setTarget} />
        <CopilotItem selection={selection} setTarget={setTarget} />
        <CopyQuoteItem selection={selection} booqId={booqId} setTarget={setTarget} />
        <CopyLinkItem selection={selection} booqId={booqId} setTarget={setTarget} />
    </>
}

function CommentTargetMenu({
    target: { parent }, booqId, user, setTarget,
}: {
    target: CommentTarget,
    booqId: BooqId,
    user: AccountDisplayData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const [comment, setComment] = useState('')
    const { addNote } = useBooqNotes({ booqId, user })

    // Extract selection from parent target
    const selection: BooqSelection = parent.kind === 'note'
        ? { range: parent.note.range, text: parent.note.text }
        : parent.selection

    const handlePost = () => {
        if (!user?.id || !comment.trim()) return

        const note = addNote({
            color: noteColorNames[0], // Default color for comments
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
        setTarget(parent)
    }

    return <div className='comment-panel'>
        <div className='quoted-text'>
            &ldquo;{selection.text}&rdquo;
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

function CopilotTargetMenu({
    target, booqId, booqMeta, setTarget,
}: {
    target: CopilotTarget,
    booqId: BooqId,
    booqMeta: BooqMetadata,
    user: AccountDisplayData | undefined,
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

    return <div className='copilot-menu'>
        <div className='quoted-text'>
            &ldquo;{selection.text}&rdquo;
        </div>
        {loading ? (
            <div className='spinner-container'>
                <Spinner />
            </div>
        ) : (
            <div className='suggestions-container'>
                {suggestions.map((suggestion, i) => (
                    <div key={i}>
                        <div
                            className='suggestion-item'
                            onClick={() => setQuestion(suggestion)}
                        >
                            {`${i + 1}. ${suggestion}`}
                        </div>
                        {i < suggestions.length - 1 && <ModalDivider />}
                    </div>
                ))}
            </div>
        )}
        <style jsx>{`
            .copilot-menu {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 16px;
                min-width: 300px;
                max-width: 400px;
                font-family: var(--font-main);
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
            .spinner-container {
                display: flex;
                justify-content: center;
                padding: 20px;
            }
            .suggestions-container {
                display: flex;
                flex-direction: column;
            }
            .suggestion-item {
                display: flex;
                cursor: pointer;
                text-decoration: dotted;
                color: var(--theme-dimmed);
                font-size: 16px;
                font-weight: bold;
                padding: 12px;
                transition: all 0.2s;
            }
            .suggestion-item:hover {
                text-decoration: underline;
                color: var(--theme-highlight);
            }
        `}</style>
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

    return <div className='copilot-question'>
        <div className='question-header'>
            <button className='back-button' onClick={onBack}>← Back</button>
            <button className='close-button' onClick={onClose}>×</button>
        </div>
        <div className='question-text'>
            <strong>Q: {question}</strong>
        </div>
        <ModalDivider />
        <div className='answer-content'>
            {loading ? (
                <div className='spinner-container'>
                    <Spinner />
                </div>
            ) : (
                <div className='answer-text'>
                    {answer}
                </div>
            )}
        </div>
        <style jsx>{`
            .copilot-question {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 16px;
                min-width: 300px;
                max-width: 400px;
                font-family: var(--font-main);
            }
            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .back-button, .close-button {
                background: transparent;
                border: none;
                color: var(--theme-dimmed);
                cursor: pointer;
                font-size: 14px;
                padding: 4px 8px;
                transition: color 0.2s;
            }
            .back-button:hover, .close-button:hover {
                color: var(--theme-primary);
            }
            .close-button {
                font-size: 18px;
                font-weight: bold;
            }
            .question-text {
                font-size: 14px;
                line-height: 1.4;
                color: var(--theme-primary);
            }
            .answer-content {
                flex: 1;
            }
            .spinner-container {
                display: flex;
                justify-content: center;
                padding: 20px;
            }
            .answer-text {
                font-size: 14px;
                line-height: 1.6;
                color: var(--theme-primary);
                white-space: pre-wrap;
            }
        `}</style>
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
