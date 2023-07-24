import { ClientReader } from '@/app/(booq)/booq/ClientReader'
import { fetchBooqFragmentServer } from '@/app/(booq)/booq/fetch'
import { pathFromString } from '@/core'


export default async function BooqPathPage({
    params: { source, id, path },
}: {
    params: {
        source: string,
        id: string,
        path: string,
    },
}) {
    const booqId = `${source}/${id}`
    const booqPath = pathFromString(path)
    const booq = await fetchBooqFragmentServer(booqId, booqPath ?? undefined)
    if (!booq)
        return null
    return <ClientReader booq={booq} />
}