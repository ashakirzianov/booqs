import { fetchBooqFragmentServer } from '@/app/(booq)/booq/fetch'
import { AppProvider } from '@/application/provider'
import { rangeFromString } from '@/core'
import { Reader } from '@/reader/Reader'


export default async function BooqPathPage({
    params: { source, id, quote },
}: {
    params: {
        source: string,
        id: string,
        quote: string,
    },
}) {
    const booqId = `${source}/${id}`
    const booqRange = rangeFromString(quote)
    if (!booqRange)
        return null
    const booq = await fetchBooqFragmentServer(booqId, booqRange.start)
    if (!booq)
        return null
    return <AppProvider>
        <Reader booq={booq} quote={booqRange} />
    </AppProvider>
}