'use client'
import { BooqCardData } from '@/components/BooqCard'
import { BooqCollection } from './BooqCollection'
import {
    READING_LIST_COLLECTION, useAddToCollection, useCollectionIds, useRemoveFromCollection,
} from '@/application/collections'
import { useAuth } from '@/application/auth'
export function Featured({ cards }: {
    cards: BooqCardData[],
}) {
    let { signed } = useAuth() ?? {}
    let { ids, loading } = useCollectionIds(READING_LIST_COLLECTION)
    let { addToCollection } = useAddToCollection(READING_LIST_COLLECTION)
    let { removeFromCollection } = useRemoveFromCollection(READING_LIST_COLLECTION)
    return <BooqCollection
        cards={cards} title='Featured Books'
        collection={signed && !loading ? ids : undefined}
        addToCollection={addToCollection}
        removeFromCollection={removeFromCollection}
    />
}
