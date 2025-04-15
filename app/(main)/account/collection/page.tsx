import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { getUserIdInsideRequest } from '@/data/auth'
import { booqCollection } from '@/data/booqs'

export default async function MyBooqs() {
    const userId = await getUserIdInsideRequest()
    const [readingList, uploads] = userId
        ? await Promise.all([
            booqCollection(READING_LIST_COLLECTION, userId), booqCollection('uploads', userId),
        ])
        : [[], []]
    return <>
        <BooqCollection
            title='Uploads'
            cards={uploads}
        />
        <BooqCollection
            title='My Booqs'
            cards={readingList}
            collection={READING_LIST_COLLECTION}
        />
    </>
}