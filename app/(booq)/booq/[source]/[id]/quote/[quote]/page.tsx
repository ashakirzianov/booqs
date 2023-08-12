import { fetchBooqFragment, fetchBooqMeta } from '@/app/data'
import { AppProvider } from '@/application/provider'
import { rangeFromString } from '@/core'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({
    params: { source, id, quote },
}: {
    params: {
        source: string,
        id: string,
        quote: string,
    },
}): Promise<Metadata> {
    const booqId = `${source}/${id}`
    const booqRange = rangeFromString(quote)
    const meta = await fetchBooqMeta(booqId, booqRange?.start, booqRange?.end)
    return {
        title: meta?.title ?? 'Booq',
        description: meta?.preview,
    }
}

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
    const booq = await fetchBooqFragment(booqId, booqRange.start)
    if (!booq)
        return notFound()
    return <AppProvider>
        <Reader booq={booq} quote={booqRange} />
    </AppProvider>
}