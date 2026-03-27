import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { ResolverContext } from './context'
import { BooqId } from '@/core'
import { BooqData } from '@/backend/library'

export type CollectionParent = {
    name: string,
    booqIds: BooqId[],
}
export const collectionResolver: IResolvers<CollectionParent, ResolverContext> = {
    Collection: {
        name(parent): string {
            return parent.name
        },
        async booqs(parent, _, { booqDataLoader }): Promise<BooqParent[]> {
            const cards = await booqDataLoader.loadMany(parent.booqIds)
            return cards.filter((card): card is BooqData => card !== undefined && !(card instanceof Error))
        },
    },
}
