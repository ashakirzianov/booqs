import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { ResolverContext } from './context'
import { BooqId, positionForPath, previewForPath } from '@/core'
import { DbReadingHistoryEvent } from '@/backend/history'

export type BooqHistoryParent = DbReadingHistoryEvent
export const booqHistoryResolver: IResolvers<BooqHistoryParent, ResolverContext> = {
    BooqHistory: {
        async booq(parent, _, { booqDataLoader }): Promise<BooqParent | undefined> {
            return booqDataLoader.load(parent.booqId as BooqId)
        },
        async preview(parent, { length }, { booqLoader }) {
            const booq = await booqLoader.load(parent.booqId as BooqId)
            if (!booq) {
                return undefined
            }
            const preview = previewForPath(booq.nodes, parent.path, length)
            return preview?.trim()?.substring(0, length)
        },
        async position(parent, _, { booqLoader }) {
            const booq = await booqLoader.load(parent.booqId as BooqId)
            if (!booq) {
                return undefined
            }
            const position = positionForPath(booq.nodes, parent.path)
            return position
        },
    },
}
