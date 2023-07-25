import { Featured } from '@/components/Featured'
import { AppBar } from '@/components/AppBar'
import { AppProvider } from '@/application/provider'
import ReadingHistory from '@/components/ReadingHistory'
import { AppButtons } from '@/components/AppButtons'
import { WiredSearch } from './client'
import { fetchFeaturedServer } from '@/app/fetch'

export default async function Home() {
    const featured = await fetchFeaturedServer()
    return <>
        <AppBar
            left={<WiredSearch />}
            right={<AppButtons />}
        />
        <AppProvider>
            <ReadingHistory />
        </AppProvider>
        <Featured cards={featured} />
    </>
}
