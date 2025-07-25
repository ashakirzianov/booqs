import { IResolvers } from '@graphql-tools/utils'
// import { BooqParent } from './booq'
// import { queryLibrary } from '@/backend/library'

export type AuthorParent = {
    kind: 'author',
    name: string,
}
export const authorResolver: IResolvers<AuthorParent> = {
    Author: {
        //     TODO: implement author query
        // async booqs(parent, { limit, offset }): Promise<BooqParent[]> {
        //     const results = await queryLibrary('pg', { kind: 'author', name: parent.name, limit, offset })
        //     return results.cards.map(card => ({
        //         kind: 'booq',
        //         booqId: card.booqId,
        //         title: card.meta.title,
        //         authors: card.meta.authors.map(author => author.name),
        //         coverSrc: card.meta.coverSrc,
        //     }))
        //     return []
        // },
    },
}
