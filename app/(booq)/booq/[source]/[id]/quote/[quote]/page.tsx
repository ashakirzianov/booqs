import { fetchBooqFragmentServer } from '@/app/(booq)/booq/fetch'
import { AppProvider } from '@/application/provider'
import { rangeFromString } from '@/core'
import { Reader } from '@/reader/Reader'
import { notFound } from 'next/navigation'


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
        return notFound()
    const booq = await fetchBooqFragmentServer(booqId, booqRange.start)
    if (!booq)
        return notFound()
    return <AppProvider>
        <Reader booq={booq} quote={booqRange} />
    </AppProvider>
}