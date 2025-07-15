'use client'

import { useState } from 'react'
import { ProfileBadge } from '@/components/ProfilePicture'
import { EmojiSelector } from './EmojiSelector'

export function EditableProfileBadge({
    name,
    picture,
    emoji,
    size,
    border,
    onEmojiChange
}: {
    name?: string
    picture?: string
    emoji?: string
    size: number
    border: boolean
    onEmojiChange: (emoji: string) => void
}) {
    const [isHovered, setIsHovered] = useState(false)
    const [isEmojiSelectorOpen, setIsEmojiSelectorOpen] = useState(false)

    const handleEmojiSelect = (newEmoji: string) => {
        onEmojiChange(newEmoji)
    }

    return (
        <>
            <div
                className="relative cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsEmojiSelectorOpen(true)}
            >
                <ProfileBadge
                    name={name}
                    picture={picture}
                    emoji={emoji}
                    size={size}
                    border={border}
                />

                {/* Edit label on top */}
                {isHovered && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-background border border-dimmed rounded px-2 py-1 text-xs font-medium text-primary shadow-md">
                            Edit
                        </div>
                    </div>
                )}
            </div>

            <EmojiSelector
                isOpen={isEmojiSelectorOpen}
                onClose={() => setIsEmojiSelectorOpen(false)}
                currentEmoji={emoji}
                onSelect={handleEmojiSelect}
            />
        </>
    )
}