import { fetchBooqFragment, fetchBooqMeta, fetchFeaturedIds } from '@/app/data'
import { AppProvider } from '@/application/provider'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'

export async function generateStaticParams() {
    const featured = await fetchFeaturedIds()
    return featured.map(({ id }) => ({
        id,
    }))
}

export async function generateMetadata({
    params: { source, id },
}: {
    params: {
        source: string,
        id: string,
    },
}): Promise<Metadata> {
    const booqId = `${source}/${id}`
    const meta = await fetchBooqMeta(booqId)
    return {
        title: meta?.title ?? 'Booq',
        description: meta?.preview,
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
    const booq = await fetchBooqFragment(booqId)
    if (!booq)
        return null
    return <AppProvider>
        <Reader booq={booq} />
    </AppProvider>
}