import { fetchBooqFragmentServer, fetchFeaturedServer } from '@/app/fetch'
import { AppProvider } from '@/application/provider'
import { Reader } from '@/reader/Reader'

export async function generateStaticParams() {
    const featured = await fetchFeaturedServer()
    return featured.map(({ id }) => ({
        id,
    }))
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