'use client'
import { AppProvider, FeaturedItem } from '@/application'
import { Featured } from '@/components/Featured'
import { ReadingHistory } from '@/components/ReadingHistory'

export default function HomeClient({ featured }: {
    featured: FeaturedItem[],
}) {
    return <AppProvider>
        <ReadingHistory />
        <Featured cards={featured} />
    </AppProvider>
}
