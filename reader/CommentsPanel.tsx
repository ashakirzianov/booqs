import React from 'react'
import { BooqNote } from '@/core'
import { Avatar } from '@/components/Avatar'

export function CommentsPanel({ comments }: {
    comments: BooqNote[],
}) {
    return (
        <div className='flex flex-col h-full w-full'>
            <div className='p-4 border-b border-gray-200'>
                <div className='self-center tracking-widest font-bold'>NOTES</div>
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-6'>
                {comments.length === 0 ? (
                    <div className='text-gray-500 text-center py-8'>
                        No notes available
                    </div>
                ) : (
                    comments.map(note => (
                        <CommentItem key={note.id} comment={note} />
                    ))
                )}
            </div>
        </div>
    )
}

function CommentItem({ comment }: { comment: BooqNote }) {
    return (
        <div className='rounded-lg p-3 space-y-2 w-full max-w-md'>

            {/* Referenced text */}
            <div className='bg-gray-50 p-2 rounded text-sm italic border-l-2'
                style={{ borderLeftColor: comment.color }}>
                &quot;{comment.text}&quot;
            </div>

            {/* Note content */}
            {comment.content && (
                <div className='text-sm'>
                    {comment.content}
                </div>
            )}

            {/* Note metadata */}
            <div className='flex items-center justify-end gap-2 pt-1'>
                <Avatar user={comment.author} />
                <div className='text-xs text-gray-400'>
                    {new Date(comment.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}