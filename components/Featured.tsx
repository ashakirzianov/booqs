import { BooqCardData } from '@/components/BooqCard'
import { BooqCollection } from './BooqCollection'
import { READING_LIST_COLLECTION } from '@/application/collections'
export function Featured({ cards }: {
    cards: BooqCardData[],
}) {
    return <BooqCollection
        cards={cards} title='Featured Books'
        collection={READING_LIST_COLLECTION}
    />
}
