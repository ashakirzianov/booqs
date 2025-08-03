import { redirect } from 'next/navigation'
import { authHref } from '@/common/href'
import { booqCollection } from '@/data/booqs'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/app/(main)/BooqCollection'
import { getCurrentUser } from '@/data/user'
import styles from '@/app/(main)/MainLayout.module.css'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'My Collections - Booqs',
        description: 'Manage your personal book collections, uploaded books, and reading list.',
    }
}

export default async function CollectionPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect(authHref({}))
    }

    const [readingList, uploads] = await Promise.all([
        booqCollection(READING_LIST_COLLECTION, user.id, 210),
        booqCollection('uploads', user.id, 210),
    ])

    return (
        <main className={styles.mainContent}>
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
        </main>
    )
}