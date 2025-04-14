import { pathFromString } from '@/core'
import { booqPart, booqPreview, featuredIds } from '@/data/booqs'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
    const featured = await featuredIds()
    return featured.map(id => ({
        id, path: '0',
    }))
}

type Params = Promise<{
    source: string,
    id: string,
    path: string,
}>

export async function generateMetadata({
    params,
}: {
    params: Params,
}): Promise<Metadata> {
    const { source, id, path } = await params
    const booqId = `${source}/${id}`
    const booqPath = pathFromString(path)
    const meta = await booqPreview(booqId, booqPath)
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
    const { source, id, path } = await params
    const booqId = `${source}/${id}`
    const booqPath = pathFromString(path)
    const booq = await booqPart(booqId, booqPath)
    if (!booq)
        return notFound()
    return <Reader booq={booq} />
}