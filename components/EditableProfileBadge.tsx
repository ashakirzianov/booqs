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

                {/* Hover overlay */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Edit</span>
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