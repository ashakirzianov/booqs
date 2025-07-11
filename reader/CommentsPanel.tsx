import React from 'react'
import { BooqNote } from '@/core'
import { Avatar } from '@/components/Avatar'

export function CommentsPanel({ comments }: {
    comments: BooqNote[],
}) {
    return (
        <div className='flex flex-1' style={{
            padding: '0 env(safe-area-inset-right) 0 env(safe-area-inset-left)',
        }}>
            <div className='flex flex-1 flex-col text-dimmed max-h-full text-sm'>
                <div className='flex flex-col flex-1 overflow-auto mt-lg'>
                    <div className='flex flex-col xl:py-0 xl:px-4'>
                        <div className='self-center tracking-widest font-bold'>COMMENTS</div>
                    </div>
                    <div className='flex flex-col flex-1 xl:py-0 xl:px-4 space-y-6'>
                        {comments.length === 0 ? (
                            <div className='text-center py-8'>
                                No comments available
                            </div>
                        ) : (
                            comments.map(note => (
                                <CommentItem key={note.id} comment={note} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CommentItem({ comment }: { comment: BooqNote }) {
    return (
        <div className='rounded-lg p-3 space-y-2 w-full max-w-md'>

            {/* Referenced text */}
            <div className='p-2 rounded text-sm italic border-l-2'
                style={{ borderLeftColor: comment.color }}>
                &quot;{comment.text}&quot;
            </div>

            {/* Note content */}
            {comment.content && (
                <div className='text-sm text-primary'>
                    {comment.content}
                </div>
            )}

            {/* Note metadata */}
            <div className='flex items-center justify-end gap-2 pt-1'>
                <Avatar user={comment.author} />
                <div className='text-xs text-dimmed'>
                    {new Date(comment.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}