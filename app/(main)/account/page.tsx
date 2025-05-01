import { redirect } from 'next/navigation'
import { signInHref } from '@/components/Links'
import { fetchAuthData } from '@/data/auth'
import { DeleteAccountButton } from './DeleteAccountButton'
import { booqCollection } from '@/data/booqs'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { SignoutButton } from './SignoutButton'

export default async function Page() {
    const user = await fetchAuthData()
    if (!user) {
        redirect(signInHref({}))
    }
    const [readingList, uploads] = await Promise.all([
        booqCollection(READING_LIST_COLLECTION, user.id), booqCollection('uploads', user.id),
    ])
    return <>
        <BooqCollection
            title='Uploads'
            cards={uploads}
            signed={true}
        />
        <BooqCollection
            title='My Booqs'
            cards={readingList}
            collection={READING_LIST_COLLECTION}
            signed={true}
        />
        <DeleteAccountButton account={{
            name: user.name,
            joined: user.joined,
        }} />
        <SignoutButton />
    </>
}