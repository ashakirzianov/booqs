import { BooqId, parseId, pathFromString, rangeFromString } from '@/core'
import { fetchBooqPreview, fetchFullBooq } from '@/data/booqs'
import { reportBooqHistoryAction } from '@/data/history'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getUrlAndDimensions } from '@/backend/images'
import { fetchNotes } from '@/data/notes'
import { getCurrentUser } from '@/data/user'

type Params = {
    booq_id: string,
}
type SearchParams = {
    path?: string,
    quote?: string,
}

export async function generateMetadata({
    params, searchParams,
}: {
    params: Promise<Params>,
    searchParams: Promise<SearchParams>,
}): Promise<Metadata> {
    const { booq_id } = await params
    const [library, id] = parseId(booq_id as BooqId)
    if (!library || !id) {
        return notFound()
    }
    const booqId: BooqId = `${library}-${id}`
    const { quote, path } = await searchParams
    const quoteRange = quote !== undefined
        ? rangeFromString(quote)
        : undefined
    const booqPath = path !== undefined
        ? pathFromString(path)
        : undefined
    const meta = quoteRange
        ? await fetchBooqPreview(booqId, quoteRange.start, quoteRange.end)
        : await fetchBooqPreview(booqId, booqPath ?? [])

    const coverData = meta?.cover ? getUrlAndDimensions(booqId, meta.cover, 210) : undefined

    return {
        title: meta?.title ? `${meta.title} - Booqs` : 'Read Book - Booqs',
        description: meta?.text ? `${meta.text.slice(0, 160)}...` : 'Read and enjoy books online with Booqs digital library.',
        openGraph: {
            title: meta?.title || 'Read Book - Booqs',
            description: meta?.text ? `${meta.text.slice(0, 160)}...` : 'Read and enjoy books online with Booqs digital library.',
            images: coverData ? [coverData.url] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: meta?.title || 'Read Book - Booqs',
            description: meta?.text ? `${meta.text.slice(0, 160)}...` : 'Read and enjoy books online with Booqs digital library.',
            images: coverData ? [coverData.url] : undefined,
        },
    }
}

export default async function BooqPathPage({
    params, searchParams,
}: {
    params: Promise<Params>,
    searchParams: Promise<SearchParams>,
}) {
    const { booq_id } = await params
    const [library, id] = parseId(booq_id as BooqId)
    if (!library || !id) {
        return notFound()
    }
    const booqId: BooqId = `${library}-${id}`
    const { path } = await searchParams
    const booqPath = path !== undefined
        ? pathFromString(path)
        : undefined

    const [booq, notes, user] = await Promise.all([
        fetchFullBooq(booqId),
        fetchNotes({ booqId }),
        getCurrentUser(),
    ])
    if (!booq)
        return notFound()

    // Report history event before rendering the page
    if (booqPath) {
        await reportBooqHistoryAction({
            booqId: `${library}-${id}`,
            path: booqPath,
        })
    }

    return <Reader
        booqId={booqId}
        booq={booq}
        notes={notes}
        user={user}
    />
}