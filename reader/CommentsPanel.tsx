import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { BooqId, pathToId } from '@/core'
import { TabButton } from './TabButton'
import { formatRelativeTime } from '@/application/common'
import { userHref } from '@/common/href'
import { BooqNote, NoteAuthorData } from '@/data/notes'
import { NoteReplies } from './NoteReplies'
import { useBooqNotes } from '@/application/notes'
import { BackIcon, PencilIcon, RemoveIcon } from '@/components/Icons'
import { MenuButton } from './MenuButton'
import { MenuState } from './ContextMenuContent'
import { useGenerateReply } from '@/application/ask'

export function CommentsPanel({ booqId, comments, currentUser, followingUserIds, isFollowingLoading, target, setMenuState }: {
    booqId: BooqId,
    comments: BooqNote[],
    currentUser?: NoteAuthorData,
    followingUserIds?: string[],
    isFollowingLoading?: boolean,
    target: MenuState,
    setMenuState: (target: MenuState) => void,
}) {
    const selectedCommentId = target.kind === 'comment' ? target.commentId
        : target.kind === 'question-asked' ? target.commentId
        : undefined

    const { generateReply, state: replyState } = useGenerateReply({ booqId })

    const questionToGenerate = target.kind === 'question-asked' ? target.commentId : undefined
    React.useEffect(() => {
        if (questionToGenerate) {
            generateReply(questionToGenerate)
            setMenuState({ kind: 'comment', commentId: questionToGenerate })
        }
    }, [questionToGenerate, generateReply, setMenuState])

    const streamingReply = useMemo((): StreamingReply | undefined => {
        if (replyState.status === 'streaming') {
            return { noteId: replyState.noteId, answer: replyState.answer }
        }
        return undefined
    }, [replyState])

    if (selectedCommentId) {
        return <CommentDetail
            booqId={booqId}
            comments={comments}
            selectedCommentId={selectedCommentId}
            currentUser={currentUser}
            onBack={() => setMenuState({ kind: 'comments-list' })}
            streamingReply={streamingReply}
        />
    }

    return <CommentsList
        booqId={booqId}
        comments={comments}
        currentUser={currentUser}
        followingUserIds={followingUserIds}
        isFollowingLoading={isFollowingLoading}
        onSelectComment={(commentId) => setMenuState({ kind: 'comment', commentId })}
    />
}

type StreamingReply = {
    noteId: string,
    answer: string,
}

function CommentsList({ booqId, comments, currentUser, followingUserIds, isFollowingLoading, onSelectComment }: {
    booqId: BooqId,
    comments: BooqNote[],
    currentUser?: NoteAuthorData,
    followingUserIds?: string[],
    isFollowingLoading?: boolean,
    onSelectComment: (commentId: string) => void,
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
                                <div key={note.id}
                                    onClick={() => onSelectComment(note.id)}
                                    className='cursor-pointer hover:bg-dimmed/5 rounded-lg transition-colors'
                                >
                                    <CommentItem comment={note} booqId={booqId} user={currentUser} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CommentDetail({ booqId, comments, selectedCommentId, currentUser, onBack, streamingReply }: {
    booqId: BooqId,
    comments: BooqNote[],
    selectedCommentId: string,
    currentUser?: NoteAuthorData,
    onBack: () => void,
    streamingReply?: StreamingReply,
}) {
    const selectedComment = comments.find(c => c.id === selectedCommentId)

    return (
        <div className='flex flex-1' style={{
            padding: '0 env(safe-area-inset-right) 0 env(safe-area-inset-left)',
        }}>
            <div className='flex flex-1 flex-col text-dimmed max-h-full text-sm'>
                <div className='flex flex-col flex-1 overflow-auto mt-lg'>
                    <div className='flex flex-col xl:py-0 xl:px-4 space-y-3'>
                        <button
                            onClick={onBack}
                            className='flex items-center gap-1 text-dimmed hover:text-primary transition-colors bg-transparent border-none cursor-pointer self-start'
                            style={{ fontFamily: 'var(--font-main)' }}
                        >
                            <div className='w-4 h-4'><BackIcon /></div>
                            <span className='text-sm'>All comments</span>
                        </button>
                    </div>
                    <div className='flex flex-col flex-1 xl:py-0 xl:px-4 space-y-6'>
                        {selectedComment ? (
                            <CommentItem
                                comment={selectedComment}
                                booqId={booqId}
                                user={currentUser}
                                streamingReply={streamingReply}
                            />
                        ) : (
                            <div className='text-center py-8'>
                                Loading...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CommentItem({ comment, booqId, user, streamingReply }: {
    comment: BooqNote,
    booqId: BooqId,
    user?: NoteAuthorData,
    streamingReply?: StreamingReply,
}) {
    const isOwnComment = user?.id === comment.author.id
    const { updateNote, removeNote } = useBooqNotes({ booqId, user })
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content ?? '')

    const handleSave = () => {
        updateNote({ noteId: comment.id, content: editContent.trim() || null })
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditContent(comment.content ?? '')
        setIsEditing(false)
    }

    const handleRemove = () => {
        removeNote({ noteId: comment.id })
    }

    const showStreamingReply = streamingReply && streamingReply.noteId === comment.id

    return (
        <div className='rounded-lg p-3 space-y-2 w-full max-w-md'>

            {/* Referenced text */}
            <Link href={`#${pathToId(comment.range.start)}`}
                className='block p-2 rounded text-sm italic border-l-2 hover:bg-gray-50 transition-colors cursor-pointer'
                style={{ borderLeftColor: `var(--color-quote)` }}>
                &quot;{comment.targetQuote}&quot;
            </Link>

            {/* Note content */}
            {isEditing ? (
                <div className='flex flex-col gap-2'>
                    <textarea
                        className='w-full px-3 py-2 border border-dimmed rounded bg-background text-primary text-sm leading-relaxed resize-y min-h-[60px] focus:outline-none focus:border-action'
                        style={{ fontFamily: 'var(--font-main)' }}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault()
                                handleSave()
                            }
                        }}
                        rows={2}
                        autoFocus
                    />
                    <div className='flex gap-2 justify-end'>
                        <MenuButton onClick={handleCancel}>Cancel</MenuButton>
                        <MenuButton onClick={handleSave}>Save</MenuButton>
                    </div>
                </div>
            ) : (
                comment.content && (
                    <div className='text-sm text-primary'>
                        {comment.content}
                    </div>
                )
            )}

            {/* Note metadata and actions */}
            <div className='flex items-center justify-end gap-2 pt-1'>
                {isOwnComment && !isEditing && (
                    <>
                        <MenuButton onClick={() => setIsEditing(true)}>
                            <div className='w-4 h-4'><PencilIcon /></div>
                        </MenuButton>
                        <MenuButton onClick={handleRemove}>
                            <div className='w-4 h-4'><RemoveIcon /></div>
                        </MenuButton>
                    </>
                )}
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

            {/* Streaming AI reply */}
            {showStreamingReply && (
                <StreamingReplyDisplay answer={streamingReply.answer} />
            )}

            {/* Replies */}
            <NoteReplies noteId={comment.id} user={user} />
        </div>
    )
}

function StreamingReplyDisplay({ answer }: {
    answer: string,
}) {
    return (
        <div className="flex flex-col gap-1">
            <div className="border-l-2 border-action/30 px-3 text-sm text-primary">
                {answer || (
                    <span className="text-dimmed animate-pulse">Thinking...</span>
                )}
                {answer && (
                    <span className="inline-block w-1.5 h-3.5 bg-action/50 ml-0.5 animate-pulse" />
                )}
            </div>
            <div className="flex items-center gap-2 text-xs text-dimmed px-3">
                <span>🤖</span>
                <span>Booqs AI</span>
            </div>
        </div>
    )
}

function Avatar({ user }: { user?: NoteAuthorData }) {
    const display = user?.emoji || (user?.name ? user.name.charAt(0).toUpperCase() : 'X')

    return (
        <div className="w-3 h-3 rounded-full flex items-center justify-center text-[0.5rem] flex-shrink-0 leading-none">
            {display}
        </div>
    )
}
