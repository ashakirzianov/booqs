'use client'

import { BooqCollection } from '@/components/BooqCollection'
import { DeleteAccountButton } from './DeleteAccountButton'
import { SignoutButton } from './SignoutButton'
import { EditableProfileBadge } from './EditableProfileBadge'
import { useAuth } from '@/application/auth'
import { AccountData } from '@/core'

export function AccountPageClient({ 
    user, 
    readingList, 
    uploads 
}: {
    user: AccountData
    readingList: any[]
    uploads: any[]
}) {
    const { updateAccount } = useAuth()

    const handleEmojiChange = async (emoji: string) => {
        try {
            await updateAccount({ emoji })
        } catch (error) {
            console.error('Failed to update emoji:', error)
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 min-h-[calc(100vh-3rem)] flex flex-col">
            {/* Profile Section */}
            <div className="bg-background border border-dimmed rounded-lg p-6">
                <div className="flex items-center gap-4">
                    <EditableProfileBadge
                        name={user.name ?? undefined}
                        picture={user.profilePictureURL ?? undefined}
                        emoji={user.emoji ?? undefined}
                        size={4}
                        border={true}
                        onEmojiChange={handleEmojiChange}
                    />
                    <div className="flex-1">
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
                    </div>
                </div>
            </div>

            {/* Books Section */}
            <div className="space-y-6 flex-1">
                <BooqCollection
                    title='My Uploads'
                    cards={uploads}
                    signed={true}
                />
                <BooqCollection
                    title='My Reading List'
                    cards={readingList}
                    collection={'reading_list'}
                    signed={true}
                />
            </div>

            {/* Account Actions - At Bottom */}
            <div className="border-t border-dimmed pt-6 mt-8">
                <div className="flex gap-3 justify-center">
                    <SignoutButton />
                    <DeleteAccountButton account={{
                        name: user.name,
                        joinedAt: user.joinedAt,
                    }} />
                </div>
            </div>
        </div>
    )
}

function formatDate(date: string) {
    const d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}