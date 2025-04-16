import { rangeFromString } from '@/core'
import { booqPart, booqPreview } from '@/data/booqs'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Params = Promise<{
    library: string,
    id: string,
    quote: string,
}>

export async function generateMetadata({
    params,
}: {
    params: Params,
}): Promise<Metadata> {
    const { library, id, quote } = await params
    const booqId = `${library}/${id}`
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
    const { library, id, quote } = await params
    const booqId = `${library}/${id}`
    const quoteRange = rangeFromString(quote)
    if (!quoteRange)
        return notFound()
    const booq = await booqPart(booqId, quoteRange.start)
    if (!booq)
        return notFound()
    return <Reader booq={booq} quote={quoteRange} />
}