import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { getUserIdInsideRequest } from '@/data/auth'
import { booqCardsForLanguage } from '@/data/booqs'

export default async function Language({
    params,
}: {
    params: Promise<{ language: string }>,
}) {
    const { language } = await params
    const decoded = decodeURIComponent(language)
    const booqs = await booqCardsForLanguage(decoded)
    const userId = await getUserIdInsideRequest()
    const signed = userId ? true : false
    return <BooqCollection
        title={`Books in ${decoded}`}
        cards={booqs}
        collection={READING_LIST_COLLECTION}
        signed={signed}
    />
}