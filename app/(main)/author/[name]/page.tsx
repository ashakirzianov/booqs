import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { booqCardsForAuthor } from '@/data/booqs'

export default async function Author({
    params,
}: {
    params: Promise<{ name: string }>,
}) {
    const { name } = await params
    const decoded = decodeURIComponent(name)
    const booqs = await booqCardsForAuthor(decoded)
    return <BooqCollection
        title={`Books by ${decoded}`}
        cards={booqs}
        collection={READING_LIST_COLLECTION}
    />
}