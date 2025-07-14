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
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Profile Section */}
            <div className="bg-background border border-dimmed rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                    <ProfileBadge
                        name={user.name ?? undefined}
                        picture={user.profilePictureURL ?? undefined}
                        emoji={user.emoji ?? undefined}
                        size={4}
                        border={true}
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-primary">
                            {user.name || 'Anonymous User'}
                        </h1>
                        <p className="text-dimmed">
                            Member since {formatDate(user.joinedAt)}
                        </p>
                    </div>
                </div>
                
                {/* Account Actions */}
                <div className="flex gap-3 pt-4 border-t border-dimmed">
                    <SignoutButton />
                    <DeleteAccountButton account={{
                        name: user.name,
                        joinedAt: user.joinedAt,
                    }} />
                </div>
            </div>

            {/* Books Section */}
            <div className="space-y-6">
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
        </div>
    )
}

function formatDate(date: string) {
    const d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}