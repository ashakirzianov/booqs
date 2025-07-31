import { BooqId, parseId, pathFromString } from '@/core'
import { booqPart, fetchBooqPreview } from '@/data/booqs'
import { reportBooqHistoryAction } from '@/data/history'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Params = {
    booq_id: string,
    path: string,
}
type SearchParams = {
    start?: string,
    end?: string,
}

export async function generateMetadata({
    params, searchParams,
}: {
    params: Promise<Params>,
    searchParams: Promise<SearchParams>,
}): Promise<Metadata> {
    const { booq_id, path } = await params
    const [library, id] = parseId(booq_id as BooqId)
    if (!library || !id) {
        return notFound()
    }
    const booqId: BooqId = `${library}-${id}`
    const { start, end } = await searchParams
    const startPath = start && pathFromString(start)
    const endPath = end && pathFromString(end)
    const booqPath = pathFromString(path)
    const meta = startPath && endPath
        ? await fetchBooqPreview(booqId, startPath, endPath)
        : await fetchBooqPreview(booqId, booqPath ?? [])

    return {
        title: meta?.title ?? 'Booq',
        description: meta?.text,
    }
}

export default async function BooqPathPage({
    params, searchParams,
}: {
    params: Promise<Params>,
    searchParams: Promise<SearchParams>,
}) {
    const { booq_id, path } = await params
    const [library, id] = parseId(booq_id as BooqId)
    if (!library || !id) {
        return notFound()
    }
    const booqId: BooqId = `${library}-${id}`
    const { start, end } = await searchParams
    const startPath = start && pathFromString(start)
    const endPath = end && pathFromString(end)
    const booqPath = pathFromString(path)
    const quoteRange = startPath && endPath
        ? { start: startPath, end: endPath }
        : undefined
    const booq = await booqPart({
        booqId,
        path: booqPath,
        bypassCache: library === 'lo',
    })
    if (!booq)
        return notFound()

    // Report history event before rendering the page
    if (booqPath) {
        await reportBooqHistoryAction({
            booqId: `${library}-${id}`,
            path: booqPath,
        })
    }

    return <Reader booq={booq} quote={quoteRange} />
}