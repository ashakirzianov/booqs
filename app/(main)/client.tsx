'use client'
import { AppProvider, FeaturedItem } from '@/application'
import { Featured } from '@/components/Featured'

export default function HomeClient({ featured }: {
    featured: FeaturedItem[],
}) {
    return <AppProvider>
        <Featured cards={featured} />
    </AppProvider>
}
