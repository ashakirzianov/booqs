import { fetchBooqFragmentServer, fetchFeaturedServer } from '@/app/fetch'
import { AppProvider } from '@/application/provider'
import { pathFromString } from '@/core'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'

export async function generateStaticParams() {
    const featured = await fetchFeaturedServer()
    return featured.map(({ id }) => ({
        id,
    }))
}

export async function generateMetadata({
    params: { source, id, path },
}: {
    params: {
        source: string,
        id: string,
        path: string,
    },
}): Promise<Metadata> {
    const booqId = `${source}/${id}`
    const booqPath = pathFromString(path)
    const booq = await fetchBooqFragmentServer(booqId, booqPath ?? undefined)
    return {
        title: booq?.title ?? 'Booq',
        description: booq?.preview,
    }
}

export default async function BooqPathPage({
    params: { source, id },
}: {
    params: {
        source: string,
        id: string,
    },
}) {
    const booqId = `${source}/${id}`
    const booq = await fetchBooqFragmentServer(booqId, undefined)
    if (!booq)
        return null
    return <AppProvider>
        <Reader booq={booq} />
    </AppProvider>
}