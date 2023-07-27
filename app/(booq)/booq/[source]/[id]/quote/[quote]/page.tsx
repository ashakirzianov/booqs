import { fetchBooqFragmentServer } from '@/app/fetch'
import { AppProvider } from '@/application/provider'
import { rangeFromString, textForRange } from '@/core'
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
    const booq = await fetchBooqFragmentServer(booqId, booqRange?.start ?? undefined)
    const quoteText = booq && booqRange
        ? textForRange(booq.fragment.nodes, booqRange)
        : undefined
    return {
        title: booq?.title ?? 'Booq',
        description: quoteText ?? booq?.preview,
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
    const booq = await fetchBooqFragmentServer(booqId, booqRange.start)
    if (!booq)
        return notFound()
    return <AppProvider>
        <Reader booq={booq} quote={booqRange} />
    </AppProvider>
}