import { ReadingHistory } from '@/components/ReadingHistory'
import { featuredBooqCards } from '@/data/booqs'
import { getReadingHistory } from '@/data/history'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { getUserIdInsideRequest } from '@/data/auth'
import { BooqCollection } from '@/components/BooqCollection'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Home() {
    const featured = await featuredBooqCards()
    const history = await getReadingHistory()
    const userId = await getUserIdInsideRequest()
    return <>
        {history && history.length > 0
            ? <ReadingHistory history={history} />
            : null}
        <BooqCollection
            cards={featured}
            title='Featured Booqs'
            collection={READING_LIST_COLLECTION}
            signed={userId ? true : false}
        />
    </>
}
