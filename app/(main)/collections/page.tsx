import { redirect } from 'next/navigation'
import { authHref } from '@/common/href'
import { booqCollection } from '@/data/booqs'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/app/(main)/BooqCollection'
import { getCurrentUser } from '@/data/user'

export default async function CollectionPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect(authHref({}))
    }

    const [readingList, uploads] = await Promise.all([
        booqCollection(READING_LIST_COLLECTION, user.id),
        booqCollection('uploads', user.id),
    ])

    return (
        <div className="space-y-6">
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
    )
}