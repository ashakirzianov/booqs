import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { BooqId } from '@/core'
import { booqDataForIds } from '@/backend/library'

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
            return booqDataForIds(parent.booqIds)
                .then(cards => cards.filter(card => card !== undefined))
        },
    },
}
