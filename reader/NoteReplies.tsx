'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useNoteReplies } from '@/application/replies'
import { NoteAuthorData } from '@/data/notes'
import { ProfileBadge } from '@/components/ProfilePicture'
import { RemoveIcon, ReplyIcon } from '@/components/Icons'
import { formatRelativeTime } from '@/application/common'
import { userHref } from '@/common/href'
import { MenuButton } from './MenuButton'

export function NoteReplies({
    noteId, user, collapsible = false,
}: {
    noteId: string,
    user: NoteAuthorData | undefined,
    collapsible?: boolean,
}) {
    const { replies, addReply, removeReply } = useNoteReplies({ noteId, user })
    const [showForm, setShowForm] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)

    const handlePost = () => {
        if (!replyContent.trim()) return
        addReply({ content: replyContent.trim() })
        setReplyContent('')
        setShowForm(false)
    }

    const handleCancel = () => {
        setReplyContent('')
        setShowForm(false)
    }

    // In collapsible mode with no replies, show nothing
    if (collapsible && replies.length === 0) {
        return null
    }

    // In collapsible mode, show toggle when collapsed
    if (collapsible && !isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-dimmed hover:text-highlight cursor-pointer transition-colors"
            >
                Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {collapsible && replies.length > 0 && (
                <button
                    onClick={() => { setIsExpanded(false); setShowForm(false) }}
                    className="text-sm text-dimmed hover:text-highlight cursor-pointer transition-colors self-start"
                >
                    Hide replies
                </button>
            )}

            {replies.length > 0 && (
                <div className="flex flex-col gap-3">
                    {replies.map(reply => (
                        <div key={reply.id} className="flex flex-col gap-1">
                            <div className="border-l-2 border-dimmed/30 px-3 text-sm text-primary">{reply.content}</div>
                            <div className="flex items-center gap-2 text-xs text-dimmed px-3">
                                <Link
                                    href={userHref({ username: reply.author.username })}
                                    className="flex items-center gap-0 hover:text-highlight min-w-0 max-w-[120px]"
                                >
                                    <ProfileBadge
                                        border={false}
                                        size={0.8}
                                        name={reply.author.name}
                                        picture={reply.author.profilePictureURL ?? undefined}
                                        emoji={reply.author.emoji}
                                    />
                                    <span className="truncate hover:underline">{reply.author.name}</span>
                                </Link>
                                <span className="whitespace-nowrap">{formatRelativeTime(new Date(reply.createdAt))}</span>
                                {user?.id === reply.author.id && (
                                    <MenuButton onClick={() => removeReply({ replyId: reply.id })}>
                                        <div className="w-4 h-4"><RemoveIcon /></div>
                                    </MenuButton>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {user && !showForm && (
                <MenuButton onClick={() => setShowForm(true)}>
                    <div className="w-4 h-4"><ReplyIcon /></div>
                    Reply
                </MenuButton>
            )}

            {showForm && (
                <div className="flex flex-col gap-2">
                    <textarea
                        className="w-full px-3 py-2 border border-dimmed rounded bg-background text-primary text-sm leading-relaxed resize-y min-h-[60px] focus:outline-none focus:border-action"
                        style={{ fontFamily: 'var(--font-main)' }}
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault()
                                handlePost()
                            }
                        }}
                        rows={2}
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            className="px-3 py-1 border-none rounded text-sm cursor-pointer transition-opacity bg-transparent text-dimmed hover:opacity-80"
                            style={{ fontFamily: 'var(--font-main)' }}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-3 py-1 border-none rounded text-sm cursor-pointer transition-opacity bg-action text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'var(--font-main)' }}
                            onClick={handlePost}
                            disabled={!replyContent.trim()}
                        >
                            Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
