import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { booqQuery } from '@/backend/library'

export type AuthorParent = {
    kind: 'author',
    name: string,
}
export const authorResolver: IResolvers<AuthorParent> = {
    Author: {
        async booqs(parent, { limit, offset }): Promise<BooqParent[]> {
            const results = await booqQuery('pg', {
                kind: 'author',
                query: parent.name,
                limit,
                offset
            })
            return results.cards
        },
    },
}
