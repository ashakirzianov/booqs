import { fetchBooqFragment, fetchBooqMeta, fetchFeaturedIds } from '@/app/data'
import { AppProvider } from '@/application/provider'
import { pathFromString } from '@/core'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
    const featured = await fetchFeaturedIds()
    return featured.map(({ id }) => ({
        id, path: '0',
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
    const meta = await fetchBooqMeta(booqId, booqPath)
    return {
        title: meta?.title ?? 'Booq',
        description: meta?.preview,
    }
}

export default async function BooqPathPage({
    params: { source, id, path },
}: {
    params: {
        source: string,
        id: string,
        path: string,
    },
}) {
    const booqId = `${source}/${id}`
    const booqPath = pathFromString(path)
    const booq = await fetchBooqFragment(booqId, booqPath ?? undefined)
    if (!booq)
        return notFound()
    return <AppProvider>
        <Reader booq={booq} />
    </AppProvider>
}