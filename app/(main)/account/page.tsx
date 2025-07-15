import { redirect } from 'next/navigation'
import { signInHref } from '@/application/href'
import { fetchAuthData } from '@/data/auth'
import { booqCollection } from '@/data/booqs'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { AccountPageClient } from './AccountPageClient'

export default async function Page() {
    const user = await fetchAuthData()
    if (!user) {
        redirect(signInHref({}))
    }
    const [readingList, uploads] = await Promise.all([
        booqCollection(READING_LIST_COLLECTION, user.id), booqCollection('uploads', user.id),
    ])
    
    return (
        <AccountPageClient 
            user={user}
            readingList={readingList}
            uploads={uploads}
        />
    )
}