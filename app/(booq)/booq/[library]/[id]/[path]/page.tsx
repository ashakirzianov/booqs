import { pathFromString } from '@/core'
import { booqPart, fetchBooqPreview } from '@/data/booqs'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Params = {
    library: string,
    id: string,
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
    const { library, id, path } = await params
    const { start, end } = await searchParams
    const startPath = start && pathFromString(start)
    const endPath = end && pathFromString(end)
    const booqPath = pathFromString(path)
    const meta = startPath && endPath
        ? await fetchBooqPreview(`${library}/${id}`, startPath, endPath)
        : await fetchBooqPreview(`${library}/${id}`, booqPath ?? [])

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
    const { library, id, path } = await params
    const { start, end } = await searchParams
    const startPath = start && pathFromString(start)
    const endPath = end && pathFromString(end)
    const booqPath = pathFromString(path)
    const quoteRange = startPath && endPath
        ? { start: startPath, end: endPath }
        : undefined
    const booq = await booqPart({
        booqId: `${library}/${id}`,
        path: booqPath,
        bypassCache: library === 'lo',
    })
    if (!booq)
        return notFound()
    return <Reader booq={booq} quote={quoteRange} />
}