'use client'

import { useState } from 'react'
import { ProfileBadge } from '@/components/ProfilePicture'
import { EmojiSelector } from './EmojiSelector'
import { PencilIcon } from '@/components/Icons'
import { LightButton } from '@/components/Buttons'
import { AccountData } from '@/core'
import { updateProfileServerAction } from './actions'

export function ProfileData({ user }: { user: AccountData }) {
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentEmoji, setCurrentEmoji] = useState(user.emoji ?? '👤')
    const [currentName, setCurrentName] = useState(user.name ?? '')
    const [isUpdating, setIsUpdating] = useState(false)
    const [isEmojiSelectorOpen, setIsEmojiSelectorOpen] = useState(false)

    const handleEmojiChange = (emoji: string) => {
        setCurrentEmoji(emoji)
        setIsEditMode(true)
        setIsEmojiSelectorOpen(false)
    }

    const handleEmojiClick = () => {
        setIsEmojiSelectorOpen(true)
    }

    const handleEditClick = () => {
        setIsEditMode(true)
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentName(e.target.value)
        setIsEditMode(true)
    }

    const handleUpdateProfile = async () => {
        setIsUpdating(true)
        try {
            const formData = new FormData()
            formData.append('emoji', currentEmoji)
            formData.append('name', currentName)
            
            const result = await updateProfileServerAction(formData)
            
            if (result) {
                setIsEditMode(false)
                // Trigger page reload by revalidating
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to update profile:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCancel = () => {
        setCurrentEmoji(user.emoji ?? '👤')
        setCurrentName(user.name ?? '')
        setIsEditMode(false)
    }

    return (
        <div className="bg-background border border-dimmed rounded-lg p-6 flex flex-col">
            <div className="flex items-center gap-4">
                <div 
                    className="relative cursor-pointer"
                    onClick={handleEmojiClick}
                >
                    <ProfileBadge
                        name={currentName}
                        picture={user.profilePictureURL ?? undefined}
                        emoji={currentEmoji}
                        size={4}
                        border={true}
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">Edit</span>
                    </div>
                </div>
                <div className="flex-1">
                    {isEditMode ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">
                                    Display Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={currentName}
                                    onChange={handleNameChange}
                                    className="w-full px-3 py-2 border border-dimmed rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                                    placeholder="Enter your display name"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={isUpdating}
                                    className="px-4 py-2 bg-action text-white rounded-md hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUpdating && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    Update Profile
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    className="px-4 py-2 border border-dimmed text-primary rounded-md hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-primary">
                                {user.name || 'Anonymous User'}
                            </h1>
                            <div className="space-y-1 text-dimmed">
                                <p className="text-sm">
                                    <span className="font-medium">Username:</span> {user.username}
                                </p>
                                {user.email && (
                                    <p className="text-sm">
                                        <span className="font-medium">Email:</span> {user.email}
                                    </p>
                                )}
                                <p className="text-sm">
                                    <span className="font-medium">Member since:</span> {formatDate(user.joinedAt)}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            {/* Edit Profile Button - Bottom Right Corner */}
            {!isEditMode && (
                <div className="flex justify-end mt-2">
                    <LightButton onClick={handleEditClick}>
                        <div className="w-4 h-4">
                            <PencilIcon />
                        </div>
                        Edit Profile
                    </LightButton>
                </div>
            )}
            
            <EmojiSelector
                isOpen={isEmojiSelectorOpen}
                onClose={() => setIsEmojiSelectorOpen(false)}
                currentEmoji={currentEmoji}
                onSelect={handleEmojiChange}
            />
        </div>
    )
}

function formatDate(date: string) {
    const d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}