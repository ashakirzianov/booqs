import { ClientReader } from '@/app/(booq)/booq/ClientReader'
import { fetchBooqFragmentServer } from '@/app/(booq)/booq/fetch'
import { rangeFromString } from '@/core'


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
        return null
    const booq = await fetchBooqFragmentServer(booqId, booqRange.start)
    if (!booq)
        return null
    return <ClientReader booq={booq} quote={booqRange} />
}