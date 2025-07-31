import { ReadingHistory } from './ReadingHistory'
import { featuredBooqCards } from '@/data/booqs'
import { getReadingHistoryForMainPage } from '@/data/history'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { getUserIdInsideRequest } from '@/data/request'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const READING_HISTORY_LIMIT = 3 // Limit number of reading history entries on the main page

export default async function Home() {
    const featured = await featuredBooqCards()
    const historyResult = await getReadingHistoryForMainPage({ limit: READING_HISTORY_LIMIT })
    const userId = await getUserIdInsideRequest()
    return <>
        {historyResult && historyResult.entries.length > 0 && (
            <div className="mb-8">
                <ReadingHistory
                    history={historyResult.entries}
                    showFullHistoryLink={historyResult.hasMore ? (
                        <Link
                            href="/account/history"
                            className="text-action hover:text-highlight text-sm font-medium whitespace-nowrap underline"
                        >
                            Show full history
                        </Link>
                    ) : undefined}
                />
            </div>
        )}
        <BooqCollection
            cards={featured}
            title='Featured Booqs'
            collection={READING_LIST_COLLECTION}
            signed={userId ? true : false}
        />
    </>
}
