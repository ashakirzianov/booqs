import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { libraryCardsForIds } from '@/backend/library'
import { BooqId } from '@/core'

export type CollectionParent = {
    name: string,
    booqIds: BooqId[],
}
export const collectionResolver: IResolvers<CollectionParent> = {
    Collection: {
        name(parent): string {
            return parent.name
        },
        async booqs(parent): Promise<BooqParent[]> {
            return libraryCardsForIds(parent.booqIds)
                .then(cards => cards.filter(card => card !== undefined))
        },
    },
}
