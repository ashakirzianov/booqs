import DataLoader from 'dataloader'
import { Booq, BooqId } from '@/core'
import { booqForId, booqDataForIds, BooqData } from '@/backend/library'
import { DbUser, usersForIds } from '@/backend/users'
import { getFollowersCountBatch, getFollowingCountBatch } from '@/backend/follows'

export type GraphQLLoaders = {
    booqLoader: DataLoader<BooqId, Booq | undefined>,
    booqDataLoader: DataLoader<BooqId, BooqData | undefined>,
    userLoader: DataLoader<string, DbUser | null>,
    followersCountLoader: DataLoader<string, number>,
    followingCountLoader: DataLoader<string, number>,
}

export function createLoaders(): GraphQLLoaders {
    const booqLoader = new DataLoader<BooqId, Booq | undefined>(
        async (ids) => {
            return Promise.all(ids.map(id => booqForId(id)))
        },
    )

    const booqDataLoader = new DataLoader<BooqId, BooqData | undefined>(
        async (ids) => {
            return booqDataForIds(ids)
        },
    )

    const userLoader = new DataLoader<string, DbUser | null>(
        async (ids) => {
            const users = await usersForIds(ids)
            const userMap = new Map(users.map(u => [u.id, u]))
            return ids.map(id => userMap.get(id) ?? null)
        },
    )

    const followersCountLoader = new DataLoader<string, number>(
        async (ids) => getFollowersCountBatch(ids),
    )

    const followingCountLoader = new DataLoader<string, number>(
        async (ids) => getFollowingCountBatch(ids),
    )

    return { booqLoader, booqDataLoader, userLoader, followersCountLoader, followingCountLoader }
}
