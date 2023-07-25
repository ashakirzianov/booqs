import gql from 'graphql-tag'
import { fetchQuery } from '@/application/server'
import { Featured } from '@/components/Featured'
import { AppBar } from '@/components/AppBar'
import { AppProvider } from '@/application/provider'
import ReadingHistory from '@/components/ReadingHistory'
import { AppButtons } from '@/components/AppButtons'
import { WiredSearch } from './client'

export async function fetchFeaturedServer() {
    const FeaturedQuery = gql`query Featured {
        featured(limit: 10) {
            id
            title
            author
            cover(size: 210)
            tags {
                tag
                value
            }
        }
    }`
    type FeaturedData = {
        featured: {
            id: string,
            title?: string,
            author?: string,
            cover?: string,
            tags: {
                tag: string,
                value?: string,
            }[],
        }[],
    };

    const result = await fetchQuery<FeaturedData>({
        query: FeaturedQuery,
    })
    return (result.data?.featured ?? [])
        .filter(f => f !== null && f !== undefined)
}

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
