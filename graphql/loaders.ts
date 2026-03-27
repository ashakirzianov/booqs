import DataLoader from 'dataloader'
import { Booq, BooqId } from '@/core'
import { booqForId, booqDataForIds, BooqData } from '@/backend/library'

export type GraphQLLoaders = {
    booqLoader: DataLoader<BooqId, Booq | undefined>,
    booqDataLoader: DataLoader<BooqId, BooqData | undefined>,
}

export function createLoaders(): GraphQLLoaders {
    const booqLoader = new DataLoader<BooqId, Booq | undefined>(
        async (ids) => {
            return Promise.all(ids.map(id => booqForId(id)))
        },
    )

    const booqDataLoader = new DataLoader<BooqId, BooqData | undefined>(
        async (ids) => {
            return booqDataForIds([...ids])
        },
    )

    return { booqLoader, booqDataLoader }
}
