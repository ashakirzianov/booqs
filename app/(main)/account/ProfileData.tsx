'use client'

import { useState } from 'react'
import { ProfileBadge } from '@/components/ProfilePicture'
import { EmojiSelector } from './EmojiSelector'
import { PencilIcon } from '@/components/Icons'
import { LightButton } from '@/components/Buttons'
import { updateAccountAction } from '@/data/auth'
import { AccountData } from '@/data/user'

type FormState =
    | { state: 'display' }
    | { state: 'edit', emojiSelectorOpen?: boolean }
    | { state: 'loading' }
    | { state: 'error', error: string, field?: string }

export function ProfileData({ user }: { user: AccountData }) {
    const [formState, setFormState] = useState<FormState>({ state: 'display' })
    const [currentData, setCurrentData] = useState({
        emoji: user.emoji,
        name: user.name,
        username: user.username
    })

    const handleEmojiChange = (emoji: string) => {
        setCurrentData(prev => ({ ...prev, emoji }))
        setFormState({ state: 'edit', emojiSelectorOpen: false })
    }

    const handleEmojiClick = () => {
        setFormState({ state: 'edit', emojiSelectorOpen: true })
    }

    const handleEditClick = () => {
        setFormState({ state: 'edit' })
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentData(prev => ({ ...prev, name: e.target.value }))
        setFormState({ state: 'edit' })
    }

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentData(prev => ({ ...prev, username: e.target.value }))
        setFormState({ state: 'edit' })
    }

    const handleUpdateProfile = async () => {
        setFormState({ state: 'loading' })

        // Only include fields that have actually changed
        const updates: { name?: string, emoji?: string, username?: string } = {}

        if (currentData.name !== user.name) {
            updates.name = currentData.name
        }
        if (currentData.emoji !== user.emoji) {
            updates.emoji = currentData.emoji
        }
        if (currentData.username !== user.username) {
            updates.username = currentData.username
        }

        try {
            const result = await updateAccountAction(updates)

            if (result.success) {
                setFormState({ state: 'display' })
                // Trigger page reload by revalidating
                window.location.reload()
            } else {
                // Handle error from server action
                setFormState({
                    state: 'error',
                    error: result.error,
                    field: result.field
                })
            }
        } catch (error) {
            console.error('Failed to update profile:', error)
            setFormState({
                state: 'error',
                error: 'Failed to update profile'
            })
        }
    }


    const handleCancel = () => {
        setCurrentData({
            emoji: user.emoji ?? '👤',
            name: user.name,
            username: user.username
        })
        setFormState({ state: 'display' })
    }

    // Derived state for cleaner JSX
    const isEditMode = formState.state === 'edit' || formState.state === 'loading' || formState.state === 'error'
    const isLoading = formState.state === 'loading'
    const isEmojiSelectorOpen = formState.state === 'edit' && formState.emojiSelectorOpen === true
    const usernameError = formState.state === 'error' && formState.field === 'username' ? formState.error : null
    const generalError = formState.state === 'error' && formState.field !== 'username' ? formState.error : null

    // Check for changes to determine if update should be enabled
    const hasChanges = currentData.name !== user.name ||
        currentData.emoji !== user.emoji ||
        currentData.username !== user.username

    return (
        <div className="bg-background border border-dimmed rounded-lg p-6 flex flex-col">
            <div className="flex items-center gap-4">
                <div
                    className="relative cursor-pointer"
                    onClick={handleEmojiClick}
                >
                    <ProfileBadge
                        name={currentData.name}
                        picture={user.profilePictureURL ?? undefined}
                        emoji={currentData.emoji}
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
                            {generalError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <p className="text-sm text-red-600">{generalError}</p>
                                </div>
                            )}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">
                                    Display Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={currentData.name}
                                    onChange={handleNameChange}
                                    className="w-full px-3 py-2 border border-dimmed rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                                    placeholder="Enter your display name"
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-primary mb-1">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={currentData.username}
                                    onChange={handleUsernameChange}
                                    className="w-full px-3 py-2 border border-dimmed rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                                    placeholder="Enter your username"
                                />
                                {usernameError && (
                                    <p className="text-sm text-red-500 mt-1">{usernameError}</p>
                                )}
                                <p className="text-xs text-dimmed mt-1">
                                    Username can only contain letters, numbers, and hyphens
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={isLoading || !hasChanges}
                                    className="px-4 py-2 bg-action text-white rounded-md hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    Update Profile
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="px-4 py-2 border border-dimmed text-primary rounded-md hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-primary">
                                {user.name}
                            </h1>
                            <div className="space-y-1 text-dimmed">
                                <p className="text-sm">
                                    <span className="font-medium">Username:</span> {user.username}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Email:</span> {user.email}
                                </p>
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
                onClose={() => setFormState({ state: 'edit', emojiSelectorOpen: false })}
                currentEmoji={currentData.emoji}
                onSelect={handleEmojiChange}
            />
        </div>
    )
}

function formatDate(date: string) {
    const d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}