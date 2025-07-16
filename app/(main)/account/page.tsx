import { redirect } from 'next/navigation'
import { authHref } from '@/core/href'
import { fetchAuthData } from '@/data/auth'
import { booqCollection } from '@/data/booqs'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { DeleteAccountButton } from './DeleteAccountButton'
import { SignoutButton } from './SignoutButton'
import { ProfileData } from './ProfileData'

export default async function Page() {
    const user = await fetchAuthData()
    if (!user) {
        redirect(authHref({}))
    }
    const [readingList, uploads] = await Promise.all([
        booqCollection(READING_LIST_COLLECTION, user.id), booqCollection('uploads', user.id),
    ])

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 min-h-[calc(100vh-3rem)] flex flex-col">
            {/* Profile Section */}
            <ProfileData user={user} />

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