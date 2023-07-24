import { DocumentNode } from 'graphql'
import HomeClient from './client'
import gql from 'graphql-tag'
import { fetchQuery } from '@/application/server'

async function fetchFeaturedServer() {
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
    return <div className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <HomeClient featured={featured} />
    </div>
}
