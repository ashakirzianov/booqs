import { BooqCardData } from '@/components/BooqCard'
import { BooqCollection } from './BooqCollection'
export function Featured({ cards }: {
    cards: BooqCardData[],
}) {
    return <BooqCollection cards={cards} title='Featured Books' />
}
