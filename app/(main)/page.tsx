import { ReadingHistory } from '@/components/ReadingHistory'
import { featuredBooqCards } from '@/data/booqs'
import { fetchReadingHistory } from '@/data/history'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { getUserIdInsideRequest } from '@/data/auth'
import { BooqCollection } from '@/components/BooqCollection'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store' // optional, for data fetching

export default async function Home() {
    const featured = await featuredBooqCards()
    const history = await fetchReadingHistory(500)
    const userId = await getUserIdInsideRequest()
    return <>
        {history && history.length > 0
            ? <ReadingHistory history={history} />
            : null}
        <BooqCollection
            cards={featured}
            title='Featured Books'
            collection={READING_LIST_COLLECTION}
            signed={userId ? true : false}
        />
    </>
}
