import { Featured } from '@/components/Featured'
import ReadingHistory from '@/components/ReadingHistory'
import { featuredBooqCards } from '@/data/booqs'

export default async function Home() {
    const featured = await featuredBooqCards()
    return <>
        <ReadingHistory />
        <Featured cards={featured} />
    </>
}
