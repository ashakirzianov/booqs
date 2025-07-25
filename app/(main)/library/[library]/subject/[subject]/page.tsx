import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { getUserIdInsideRequest } from '@/data/auth'
import { booqCardsForSubject } from '@/data/booqs'

export default async function Subject({
    params,
}: {
    params: Promise<{ library: string, subject: string }>,
}) {
    const { library, subject } = await params
    const decoded = decodeURIComponent(subject)
    const booqs = await booqCardsForSubject({ subject: decoded, libraryId: library })
    const userId = await getUserIdInsideRequest()
    const signed = userId ? true : false
    return <BooqCollection
        title={`Books on ${decoded}`}
        cards={booqs}
        collection={READING_LIST_COLLECTION}
        signed={signed}
    />
}