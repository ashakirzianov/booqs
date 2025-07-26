import { useBooqNotes } from '@/application/notes'
import { BooqId } from '@/core'
import { BooqSelection } from '@/viewer'
import { useState } from 'react'
import type { CreateCommentTarget, ContextMenuTarget } from './ContextMenuContent'
import { AuthorData } from '@/data/user'

export function CreateCommentTargetMenu({
    target: { parent }, booqId, user, setTarget,
}: {
    target: CreateCommentTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const [comment, setComment] = useState('')
    const { addNote } = useBooqNotes({ booqId, user })

    // Extract selection from parent target
    const selection: BooqSelection = parent.selection

    const handlePost = () => {
        if (!user?.id || !comment.trim()) return

        const note = addNote({
            kind: 'comment',
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

    return <div className='flex flex-col gap-3 p-4'>
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

function removeSelection() {
    window.getSelection()?.empty()
}