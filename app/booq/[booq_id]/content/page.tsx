import { BooqId, parseIdOpt, pathFromString, rangeFromString } from '@/core'
import { fetchBooqPreview, fetchBooqSection } from '@/data/booqs'
import { reportBooqHistoryAction } from '@/data/history'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { fetchNotes } from '@/data/notes'
import { getCurrentUser } from '@/data/user'
import { booqImageUrl } from '@/common/href'

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
    const [library, id] = parseIdOpt(booq_id) ?? [null, null]
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

    const images = meta?.coverSrc
        ? [booqImageUrl({ booqId, imageId: meta.coverSrc, width: 360 })]
        : undefined

    return {
        title: meta?.title ? `${meta.title} - Booqs` : 'Read Book - Booqs',
        description: meta?.text ? `${meta.text.slice(0, 160)}...` : 'Read and enjoy books online with Booqs digital library.',
        openGraph: {
            title: meta?.title || 'Read Book - Booqs',
            description: meta?.text ? `${meta.text.slice(0, 160)}...` : 'Read and enjoy books online with Booqs digital library.',
            images,
        },
        twitter: {
            card: 'summary_large_image',
            title: meta?.title || 'Read Book - Booqs',
            description: meta?.text ? `${meta.text.slice(0, 160)}...` : 'Read and enjoy books online with Booqs digital library.',
            images,
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
    const [library, id] = parseIdOpt(booq_id) ?? [null, null]
    if (!library || !id) {
        return notFound()
    }

    const booqId: BooqId = `${library}-${id}`
    const { path } = await searchParams
    const booqPath = path !== undefined
        ? pathFromString(path)
        : undefined

    const returnTo = encodeURIComponent(`/booq/${booqId}/content${path ? `?path=${path}#path:${path}` : ''}`)
    const user = await getCurrentUser()
    if (!user) {
        redirect(`/auth?return_to=${returnTo}`)
    }
    const [booqData, notes] = await Promise.all([
        fetchBooqSection(booqId, booqPath),
        fetchNotes({ booqId }),
    ])
    if (!booqData)
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
        section={booqData.section}
        metadata={booqData.metadata}
        toc={booqData.toc}
        notes={notes}
        user={user}
    />
}