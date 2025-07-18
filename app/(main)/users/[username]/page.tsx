import { notFound } from 'next/navigation'
import { userData } from '@/data/user'
import { ProfileBadge } from '@/components/ProfilePicture'
import { booqCollection } from '@/data/booqs'
import { BooqCollection } from '@/components/BooqCollection'

export default async function UserPage({ 
    params 
}: { 
    params: Promise<{ username: string }> 
}) {
    const { username } = await params
    
    const user = await userData(username)
    if (!user) {
        notFound()
    }
    
    // Get public collections for this user (only uploads for now)
    const uploads = await booqCollection('uploads', user.id)

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Public Profile Section */}
            <div className="bg-background border border-dimmed rounded-lg p-6">
                <div className="flex items-center gap-4">
                    <ProfileBadge
                        name={user.name ?? ''}
                        picture={user.profilePictureURL}
                        emoji={user.emoji ?? '👤'}
                        size={4}
                        border={true}
                    />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-primary">
                            {user.name || 'Anonymous User'}
                        </h1>
                        <div className="space-y-1 text-dimmed">
                            <p className="text-sm">
                                <span className="font-medium">Username:</span> {user.username}
                            </p>
                            <p className="text-sm">
                                <span className="font-medium">Member since:</span> {formatDate(user.joinedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Public Books Section */}
            <div className="space-y-6">
                <BooqCollection
                    title={`${user.name || user.username}'s Books`}
                    cards={uploads}
                    signed={false}
                />
            </div>
        </div>
    )
}

function formatDate(date: string) {
    const d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}