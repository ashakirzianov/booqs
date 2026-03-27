import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { BooqParent } from './booq'
import { BooqHistoryParent } from './history'
import { CopilotInput, CopilotParent } from './copilot'
import { AuthorParent } from './author'
import { booqHistoryForUser } from '@/backend/history'
import { booqIdsInCollections } from '@/backend/collections'
import { userForUsername } from '@/backend/users'
import { CollectionParent } from './collection'
import { BooqId } from '@/core'
import { booqQuery, featuredBooqIds, LibraryQuery } from '@/backend/library'
import { notesWithAuthorFor } from '@/backend/notes'

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
        async booq(_, { id }, { booqDataLoader }): Promise<BooqParent | undefined> {
            return booqDataLoader.load(id)
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
        async me(_, __, { userId, userLoader }) {
            if (userId) {
                const user = await userLoader.load(userId)
                return user ?? undefined
            } else {
                return undefined
            }
        },
        async user(_, { username }) {
            const user = await userForUsername(username)
            return user ?? undefined
        },
        async history(_, { limit, offset }: { limit?: number, offset?: number }, { userId }): Promise<BooqHistoryParent[]> {
            const result = userId
                ? await booqHistoryForUser(userId)
                : []
            const start = offset ?? 0
            return limit !== undefined
                ? result.slice(start, start + limit)
                : result.slice(start)
        },
        async collection(_, { name }, { userId }): Promise<CollectionParent | null> {
            if (!userId) {
                return null
            }
            const booqIds: BooqId[] = await booqIdsInCollections(userId, name) as BooqId[]
            return { name, booqIds }
        },
        async notes(_, { username, limit, offset }: {
            username: string, limit?: number, offset?: number,
        }, { userId }) {
            const user = await userForUsername(username)
            if (!user) {
                return []
            }
            return notesWithAuthorFor({ authorId: user.id, userId, limit, offset })
        },
        async libraryBrowse(_, { library, kind, query, limit, offset }: {
            library: string, kind: LibraryQuery['kind'], query: string, limit?: number, offset?: number,
        }) {
            const result = await booqQuery(library, {
                kind,
                query,
                limit: limit ?? 24,
                offset,
            })
            return { booqs: result.cards, hasMore: result.hasMore }
        },
        async featured(_, { limit }, { booqDataLoader }): Promise<Array<BooqParent | undefined>> {
            const ids = await featuredBooqIds(limit)
            const results = await booqDataLoader.loadMany(ids)
            return results.map(r => r instanceof Error ? undefined : r)
        },
        copilot(_, { context }: { context: CopilotInput }): CopilotParent {
            return context
        },
    },
}
