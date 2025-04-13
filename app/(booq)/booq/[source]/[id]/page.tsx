import { booqFragment, booqPreview, featuredIds } from '@/data/booqs'
import { Reader } from '@/reader/Reader'
import { Metadata } from 'next'

export async function generateStaticParams() {
    const featured = await featuredIds()
    return featured.map(id => ({
        id,
    }))
}

type Params = Promise<{
    source: string,
    id: string,
}>

export async function generateMetadata({
    params,
}: {
    params: Params,
}): Promise<Metadata> {
    const { source, id } = await params
    const booqId = `${source}/${id}`
    const meta = await booqPreview(booqId)
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
    const { source, id } = await params
    const booqId = `${source}/${id}`
    const fragment = await booqFragment(booqId)
    if (!fragment)
        return null

    return <Reader booq={fragment} fontScale={1} />
}