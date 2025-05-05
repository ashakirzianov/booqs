import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { libraryCardsForIds } from '@/backend/library'
import { BooqCollection, filterUndefined } from '@/core'

export type CollectionParent = BooqCollection
export const collectionResolver: IResolvers<CollectionParent> = {
    Collection: {
        name(parent): string {
            return parent.name
        },
        async booqs(parent): Promise<BooqParent[]> {
            return libraryCardsForIds(parent.booqIds)
                .then(filterUndefined)
        },
    },
}
