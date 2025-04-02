import { Featured } from '@/components/Featured'
import { AppProvider } from '@/application/provider'
import ReadingHistory from '@/components/ReadingHistory'
import { fetchQuery } from '@/application/server'
import { gql } from '@apollo/client'

export default async function Home() {
    const featured = await fetchFeatured()
    return <>
        <AppProvider>
            <ReadingHistory />
        </AppProvider>
        <Featured cards={featured} />
    </>
}

async function fetchFeatured() {
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
    }

    const result = await fetchQuery<FeaturedData>({
        query: FeaturedQuery,
    })
    const featured = result.success
        ? result.data?.featured ?? []
        : []
    return featured
        .filter(f => f !== null && f !== undefined)
}
