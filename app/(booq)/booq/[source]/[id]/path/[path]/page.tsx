import { fetchBooqFragmentServer } from '@/app/(booq)/booq/fetch'
import { AppProvider } from '@/application/provider'
import { pathFromString } from '@/core'
import { Reader } from '@/reader/Reader'


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
        return null
    return <AppProvider>
        <Reader booq={booq} />
    </AppProvider>
}