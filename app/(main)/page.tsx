import { Featured } from '@/components/Featured'
import { ReadingHistory } from '@/components/ReadingHistory'
import { featuredBooqCards } from '@/data/booqs'
import { fetchReadingHistory } from '@/data/history'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store' // optional, for data fetching

export default async function Home() {
    const featured = await featuredBooqCards()
    const history = await fetchReadingHistory(500)
    return <>
        {history && history.length > 0
            ? <ReadingHistory history={history} />
            : null}
        <Featured cards={featured} />
    </>
}
