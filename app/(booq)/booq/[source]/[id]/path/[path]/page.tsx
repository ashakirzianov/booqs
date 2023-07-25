import { fetchBooqFragmentServer } from '@/app/(booq)/booq/fetch'
import { fetchFeaturedServer } from '@/app/(main)/page'
import { AppProvider } from '@/application/provider'
import { pathFromString } from '@/core'
import { Reader } from '@/reader/Reader'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
    const featured = await fetchFeaturedServer()
    return featured.map(({ id }) => ({
        id, path: '0',
    }))
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
    const booq = await fetchBooqFragmentServer(booqId, booqPath ?? undefined)
    if (!booq)
        return notFound()
    return <AppProvider>
        <Reader booq={booq} />
    </AppProvider>
}