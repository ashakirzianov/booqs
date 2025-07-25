import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { getUserIdInsideRequest } from '@/data/auth'
import { booqCardsForAuthor } from '@/data/booqs'

export default async function Author({
    params,
}: {
    params: Promise<{ library: string, name: string }>,
}) {
    const { library, name } = await params
    const decoded = decodeURIComponent(name)
    const booqs = await booqCardsForAuthor({ author: decoded, libraryId: library })
    const userId = await getUserIdInsideRequest()
    const signed = userId ? true : false
    return <BooqCollection
        title={`Books by ${decoded}`}
        cards={booqs}
        collection={READING_LIST_COLLECTION}
        signed={signed}
    />
}