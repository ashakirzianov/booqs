import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { getUserIdInsideRequest } from '@/data/auth'
import { booqCardsForSubject } from '@/data/booqs'

export default async function Subject({
    params,
}: {
    params: Promise<{ subject: string }>,
}) {
    const { subject } = await params
    const decoded = decodeURIComponent(subject)
    const booqs = await booqCardsForSubject(decoded)
    const userId = await getUserIdInsideRequest()
    const signed = userId ? true : false
    return <BooqCollection
        title={`Booqs on ${decoded}`}
        cards={booqs}
        collection={READING_LIST_COLLECTION}
        signed={signed}
    />
}