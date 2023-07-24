'use client'
import { AppProvider, FeaturedItem } from '@/application'
import { AppBar } from '@/components/AppBar'
import { Featured } from '@/components/Featured'
import { ReadingHistory } from '@/components/ReadingHistory'

export default function HomeClient({ featured }: {
    featured: FeaturedItem[],
}) {
    return <AppProvider>
        <AppBar />
        <ReadingHistory />
        <Featured cards={featured} />
    </AppProvider>
}
