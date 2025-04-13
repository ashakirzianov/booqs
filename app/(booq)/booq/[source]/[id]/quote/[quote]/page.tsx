import { rangeFromString } from '@/core'
import { booqFragment, booqPreview } from '@/data/booqs'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Params = Promise<{
    source: string,
    id: string,
    quote: string,
}>

export async function generateMetadata({
    params,
}: {
    params: Params,
}): Promise<Metadata> {
    const { source, id, quote } = await params
    const booqId = `${source}/${id}`
    const booqRange = rangeFromString(quote)
    const meta = await booqPreview(booqId, booqRange?.start, booqRange?.end)
    return {
        title: meta?.title ?? 'Booq',
        description: meta?.preview,
    }
}

export default async function BooqPathPage({
    params,
}: {
    params: Params,
}) {
    const { source, id, quote } = await params
    const booqId = `${source}/${id}`
    const quoteRange = rangeFromString(quote)
    if (!quoteRange)
        return notFound()
    const booq = await booqFragment(booqId, quoteRange.start)
    if (!booq)
        return notFound()
    return <Reader booq={booq} quote={quoteRange} />
}