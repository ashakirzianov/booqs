import React from 'react'
import Link from 'next/link'
import { pathToId } from '@/core'
import { TabButton } from './TabButton'
import { formatRelativeTime } from '@/application/common'
import { userHref } from '@/common/href'
import { BooqNote, NoteAuthorData } from '@/data/notes'

export function CommentsPanel({ comments, currentUser, followingUserIds, isFollowingLoading }: {
    comments: BooqNote[],
    currentUser?: { id: string },
    followingUserIds?: string[],
    isFollowingLoading?: boolean,
}) {
    const [commentsFilter, setCommentsFilter] = React.useState<'all' | 'following'>('all')

    const filteredComments = React.useMemo(() => {
        if (commentsFilter === 'all' || !currentUser || !followingUserIds) {
            return comments
        }

        return comments.filter(comment =>
            comment.author.id === currentUser.id ||
            followingUserIds.includes(comment.author.id)
        )
    }, [comments, commentsFilter, currentUser, followingUserIds])
    return (
        <div className='flex flex-1' style={{
            padding: '0 env(safe-area-inset-right) 0 env(safe-area-inset-left)',
        }}>
            <div className='flex flex-1 flex-col text-dimmed max-h-full text-sm'>
                <div className='flex flex-col flex-1 overflow-auto mt-lg'>
                    <div className='flex flex-col xl:py-0 xl:px-4 space-y-3'>
                        <div className='self-center tracking-widest font-bold'>COMMENTS</div>
                        {currentUser && (
                            <div className='flex items-center justify-center'>
                                <div className='flex'>
                                    <TabButton
                                        text="All"
                                        selected={commentsFilter === 'all'}
                                        onClick={() => setCommentsFilter('all')}
                                    />
                                    <TabButton
                                        text={`Following${isFollowingLoading ? ' (loading...)' : ''}`}
                                        selected={commentsFilter === 'following'}
                                        onClick={() => !isFollowingLoading && setCommentsFilter('following')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col flex-1 xl:py-0 xl:px-4 space-y-6'>
                        {filteredComments.length === 0 ? (
                            <div className='text-center py-8'>
                                {commentsFilter === 'following' && currentUser ? 'No comments from people you follow' : 'No comments available'}
                            </div>
                        ) : (
                            filteredComments.map(note => (
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
            <Link href={`#${pathToId(comment.range.start)}`}
                className='block p-2 rounded text-sm italic border-l-2 hover:bg-gray-50 transition-colors cursor-pointer'
                style={{ borderLeftColor: `var(--color-quote)` }}>
                &quot;{comment.targetQuote}&quot;
            </Link>

            {/* Note content */}
            {comment.content && (
                <div className='text-sm text-primary'>
                    {comment.content}
                </div>
            )}

            {/* Note metadata */}
            <div className='flex items-center justify-end gap-2 pt-1'>
                <Link
                    href={userHref({ username: comment.author.username })}
                    className='flex items-center gap-2 hover:bg-gray-50 rounded px-1 py-0.5 transition-colors'
                >
                    <Avatar user={comment.author} />
                    <span className='text-xs text-dimmed hover:text-primary'>
                        {comment.author.name}
                    </span>
                </Link>
                <div className='text-xs text-dimmed'>
                    {formatRelativeTime(new Date(comment.createdAt))}
                </div>
            </div>
        </div>
    )
}

function Avatar({ user }: { user?: NoteAuthorData }) {
    const display = user?.emoji || (user?.name ? user.name.charAt(0).toUpperCase() : 'X')

    return (
        <div className="w-3 h-3 rounded-full flex items-center justify-center text-[0.5rem] font-semibold flex-shrink-0 leading-none">
            {display}
        </div>
    )
}