import { redirect } from 'next/navigation'
import { signInHref } from '@/application/href'
import { fetchAuthData } from '@/data/auth'
import { DeleteAccountButton } from './DeleteAccountButton'
import { booqCollection } from '@/data/booqs'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { SignoutButton } from './SignoutButton'
import { ProfileBadge } from '@/components/ProfilePicture'

export default async function Page() {
    const user = await fetchAuthData()
    if (!user) {
        redirect(signInHref({}))
    }
    const [readingList, uploads] = await Promise.all([
        booqCollection(READING_LIST_COLLECTION, user.id), booqCollection('uploads', user.id),
    ])
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 min-h-screen flex flex-col">
            {/* Profile Section */}
            <div className="bg-background border border-dimmed rounded-lg p-6">
                <div className="flex items-center gap-4">
                    <ProfileBadge
                        name={user.name ?? undefined}
                        picture={user.profilePictureURL ?? undefined}
                        emoji={user.emoji ?? undefined}
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
                    collection={READING_LIST_COLLECTION}
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