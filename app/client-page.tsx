'use client'
import { AppProvider, FeaturedItem } from '@/application'
import { AppBar } from '@/components/AppBar'
import { Featured } from '@/components/Featured'
import { ReadingHistory } from '@/components/ReadingHistory'

export default function ClientHome({ featured }: {
    featured: FeaturedItem[],
}) {
    return <AppProvider>
        <div className="flex flex-col font-main font-normal overflow-hidden">
            <AppBar />
            <ReadingHistory />
            <Featured cards={featured} />
        </div>
    </AppProvider>
}