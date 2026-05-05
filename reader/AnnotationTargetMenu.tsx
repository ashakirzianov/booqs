import Link from 'next/link'
import { useMemo, useState } from 'react'
import * as clipboard from 'clipboard-polyfill'
import { BooqId } from '@/core'
import type { MenuState, AnnotationTarget } from './ContextMenuContent'
import { ColorPicker } from '@/components/ColorPicker'
import { formatRelativeTime } from '@/application/common'
import { useBooqAnnotations } from '@/application/annotations'
import { ProfileBadge } from '@/components/ProfilePicture'
import { CommentIcon, RemoveIcon, QuestionMarkIcon, ShareIcon } from '@/components/Icons'
import { NoteReplies } from './NoteReplies'
import { generateQuote } from './ContextMenuItems'
import { AnnotationAuthorData } from '@/data/annotations'
import { userHref } from '@/common/href'
import { MenuButton } from './MenuButton'

export function AnnotationTargetMenu({
    target, booqId, user, setMenuState
}: {
    target: AnnotationTarget,
    booqId: BooqId,
    user: AnnotationAuthorData | undefined,
    setMenuState: (target: MenuState) => void,
}) {
    const { annotationId, editMode } = target
    const { annotations, updateAnnotation, removeAnnotation } = useBooqAnnotations({ booqId, user })
    const annotation = useMemo(() =>
        annotations.find(a => a.id === annotationId), [annotations, annotationId])
    const isOwn = user?.id === annotation?.author?.id
    const isAuthenticated = !!user?.id
    const hasColor = annotation?.kind === 'highlight'
    const [editContent, setEditContent] = useState(annotation?.content || null)
    if (!annotation) {
        return null
    }

    const handleColorChange = (color: string) => {
        updateAnnotation({ annotationId, color })
    }

    const handleRemove = () => {
        if (annotation) {
            removeAnnotation({ annotationId: annotation.id })
            setMenuState({ kind: 'empty' })
        }
    }

    const handleEdit = () => {
        setMenuState({
            ...target,
            editMode: true,
        })
    }

    const handleSave = () => {
        updateAnnotation({ annotationId, content: editContent })
        setMenuState({
            ...target,
            editMode: false,
        })
    }

    const handleCancelEdit = () => {
        setEditContent(annotation.content ?? '')
        setMenuState({
            ...target,
            editMode: false,
        })
    }

    const handleAskQuestion = () => {
        setMenuState({
            kind: 'ask',
            selection: target.selection,
        })
    }

    const handleShare = () => {
        const quote = generateQuote(booqId, target.selection.text, target.selection.range)
        clipboard.writeText(quote)
        setMenuState({ kind: 'empty' })
    }

    return (
        <div
            className="flex flex-col"
        >
            {/* Color picker - shown for own annotations */}
            {isOwn && isAuthenticated && hasColor && (
                <div className='h-10'>
                    <ColorPicker
                        selectedColor={annotation.color}
                        onColorChange={handleColorChange}
                    />
                </div>
            )}

            {/* Content container with padding */}
            <div className="px-3 py-3 gap-3 flex flex-col bg-background">
                {editMode ? (
                    /* Edit mode UI */
                    <>
                        <textarea
                            className='w-full px-3 border border-dimmed rounded bg-background text-primary text-sm leading-relaxed resize-y min-h-[80px] focus:outline-none focus:border-action mb-3'
                            style={{ fontFamily: 'var(--font-main)' }}
                            placeholder='Add a note...'
                            value={editContent ?? ''}
                            onChange={(e) => setEditContent(e.target.value || null)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault()
                                    handleSave()
                                }
                            }}
                            rows={3}
                            autoFocus
                        />
                        <div className="flex flex-row justify-start gap-4">
                            <MenuButton
                                onClick={handleSave}
                            >
                                <div className="w-4 h-4"><CommentIcon /></div>
                                Save note
                            </MenuButton>
                            <MenuButton
                                onClick={handleCancelEdit}
                            >
                                <div className="w-4 h-4"><RemoveIcon /></div>
                                Cancel
                            </MenuButton>
                        </div>
                    </>
                ) : (
                    /* Display mode UI */
                    <>
                        {/* Note content or add note prompt */}
                        {annotation.content ? (
                            <div className="text-sm text-primary">
                                {annotation.content}
                            </div>
                        ) : (isOwn && (
                            <div className="text-sm">
                                <span
                                    className="cursor-pointer hover:underline text-dimmed"
                                    onClick={handleEdit}
                                >
                                    Add note
                                </span>
                            </div>
                        ))}

                        {/* Action buttons */}
                        <div className="flex flex-row flex-wrap justify-start gap-4">
                            {isOwn && annotation.content && (
                                <MenuButton
                                    onClick={handleEdit}
                                >
                                    <div className="w-4 h-4"><CommentIcon /></div>
                                    Edit
                                </MenuButton>
                            )}
                            {isAuthenticated && (
                                <MenuButton
                                    onClick={handleAskQuestion}
                                >
                                    <div className="w-4 h-4"><QuestionMarkIcon /></div>
                                    Ask
                                </MenuButton>
                            )}
                            <MenuButton
                                onClick={handleShare}
                            >
                                <div className="w-4 h-4"><ShareIcon /></div>
                                Share
                            </MenuButton>
                            {isOwn && (
                                <MenuButton
                                    onClick={handleRemove}
                                >
                                    <div className="w-4 h-4"><RemoveIcon /></div>
                                    Remove
                                </MenuButton>
                            )}
                        </div>

                        {/* Replies - shown for public comments */}
                        {annotation.privacy === 'public' && annotation.kind === 'comment' && (
                            <NoteReplies annotationId={annotation.id} user={user} />
                        )}

                        {/* Author info and date */}
                        {!isOwn && (<span className="text-xs text-dimmed flex flex-row items-center justify-start flex-wrap">
                            <Link
                                href={userHref({ username: annotation.author.username })}
                                className="flex justify-start cursor-pointer hover:text-highlight transition-opacity gap-0 min-w-0 max-w-[140px]"
                            >
                                <ProfileBadge
                                    border={false}
                                    size={1}
                                    name={annotation.author.name}
                                    picture={annotation.author.profilePictureURL ?? undefined}
                                    emoji={annotation.author.emoji}
                                />
                                <span className='hover:underline truncate' title={annotation.author.name}>{annotation.author.name}</span>
                            </Link>&nbsp;
                            <span className="whitespace-nowrap">{annotation.createdAt === annotation.updatedAt ? 'created' : 'edited'} {formatRelativeTime(new Date(annotation.updatedAt))}</span>
                        </span>)}
                    </>
                )}
            </div>
        </div>
    )
}
