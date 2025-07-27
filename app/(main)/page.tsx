import { ReadingHistory } from '@/components/ReadingHistory'
import { featuredBooqCards } from '@/data/booqs'
import { getReadingHistoryWithDetailedEntries } from '@/data/history'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { getUserIdInsideRequest } from '@/data/request'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Home() {
    const featured = await featuredBooqCards()
    const historyResult = await getReadingHistoryWithDetailedEntries({ limit: 10 })
    const userId = await getUserIdInsideRequest()
    return <>
        {historyResult && historyResult.entries.length > 0
            ? <ReadingHistory history={historyResult.entries} />
            : null}
        <BooqCollection
            cards={featured}
            title='Featured Booqs'
            collection={READING_LIST_COLLECTION}
            signed={userId ? true : false}
        />
    </>
}
