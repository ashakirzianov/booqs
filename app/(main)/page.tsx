import { Featured } from '@/components/Featured'
import { AppProvider } from '@/application/provider'
import ReadingHistory from '@/components/ReadingHistory'
import { fetchFeaturedServer } from '@/app/fetch'

export default async function Home() {
    const featured = await fetchFeaturedServer()
    return <>
        <AppProvider>
            <ReadingHistory />
        </AppProvider>
        <Featured cards={featured} />
    </>
}
