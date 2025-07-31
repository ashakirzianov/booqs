import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { BooqParent } from './booq'
import { BooqHistoryParent } from './history'
import { CopilotInput, CopilotParent } from './copilot'
import { AuthorParent } from './author'
import { booqHistoryForUser } from '@/backend/history'
import { booqIdsInCollections } from '@/backend/collections'
import { userForId, userForUsername } from '@/backend/users'
import { CollectionParent } from './collection'
import { BooqId } from '@/core'
import { booqDataForId, booqDataForIds, booqQuery, featuredBooqIds } from '@/backend/library'

type SearchResultParent = BooqParent | AuthorParent

export const queryResolver: IResolvers<unknown, ResolverContext> = {
    SearchResult: {
        __resolveType(parent: BooqParent | AuthorParent): 'Booq' | 'Author' {
            return parent.kind === 'author'
                ? 'Author'
                : 'Booq'
        },
    },
    Query: {
        ping() {
            return 'pong'
        },
        async booq(_, { id }): Promise<BooqParent | undefined> {
            return booqDataForId(id)
        },
        author(_, { name }): AuthorParent {
            return { name, kind: 'author' }
        },
        async search(_, { query, limit }: {
            query: string,
            limit?: number,
        }): Promise<SearchResultParent[]> {
            const results = await booqQuery('pg', { kind: 'search', query, limit: limit ?? 100 })
            return results.cards
        },
        async me(_, __, { userId }) {
            if (userId) {
                const user = await userForId(userId)
                return user ?? undefined
            } else {
                return undefined
            }
        },
        async user(_, { username }) {
            const user = await userForUsername(username)
            return user ?? undefined
        },
        async history(_, __, { userId }): Promise<BooqHistoryParent[]> {
            const result = userId
                ? await booqHistoryForUser(userId)
                : []
            return result
        },
        async collection(_, { name }, { userId }): Promise<CollectionParent | null> {
            if (!userId) {
                return null
            }
            const booqIds: BooqId[] = await booqIdsInCollections(userId, name) as BooqId[]
            return { name, booqIds }
        },
        async featured(_, { limit }): Promise<Array<BooqParent | undefined>> {
            const ids = await featuredBooqIds(limit)
            return booqDataForIds(ids)
        },
        copilot(_, { context }: { context: CopilotInput }): CopilotParent {
            return context
        },
    },
}
