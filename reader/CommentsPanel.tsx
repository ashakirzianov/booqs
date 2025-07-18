import React from 'react'
import Link from 'next/link'
import { BooqNote, pathToId, userHref } from '@/core'
import { Avatar } from '@/components/Avatar'

export function CommentsPanel({ comments, currentUser, followingUserIds, isFollowingLoading }: {
    comments: BooqNote[],
    currentUser?: { id: string },
    followingUserIds?: string[],
    isFollowingLoading?: boolean,
}) {
    const [showFollowingOnly, setShowFollowingOnly] = React.useState(false)
    
    const filteredComments = React.useMemo(() => {
        if (!showFollowingOnly || !currentUser || !followingUserIds) {
            return comments
        }
        
        return comments.filter(comment => 
            comment.author.id === currentUser.id || 
            followingUserIds.includes(comment.author.id)
        )
    }, [comments, showFollowingOnly, currentUser, followingUserIds])
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
                                <label className='flex items-center gap-2 text-xs cursor-pointer'>
                                    <input
                                        type="checkbox"
                                        checked={showFollowingOnly}
                                        onChange={(e) => setShowFollowingOnly(e.target.checked)}
                                        disabled={isFollowingLoading}
                                        className='rounded'
                                    />
                                    <span>Following only{isFollowingLoading ? ' (loading...)' : ''}</span>
                                </label>
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col flex-1 xl:py-0 xl:px-4 space-y-6'>
                        {filteredComments.length === 0 ? (
                            <div className='text-center py-8'>
                                {showFollowingOnly && currentUser ? 'No comments from people you follow' : 'No comments available'}
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
                style={{ borderLeftColor: comment.color }}>
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

function formatDateString(date: Date, currentDate: Date): string {
    const isSameYear = date.getFullYear() === currentDate.getFullYear()

    if (isSameYear) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }
}

function formatRelativeTime(date: Date, currentDate: Date = new Date()): string {
    const diffMs = currentDate.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    // If more than 7 days, show date
    if (diffDays > 7) {
        return formatDateString(date, currentDate)
    }

    // Relative time formatting
    if (diffSeconds < 60) {
        return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    }
}