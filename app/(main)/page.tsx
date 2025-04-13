import { Featured } from '@/components/Featured'
import { featuredBooqCards } from '@/data/booqs'

export default async function Home() {
    const featured = await featuredBooqCards()
    return <>
        <Featured cards={featured} />
    </>
}
