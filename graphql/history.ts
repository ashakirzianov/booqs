import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { BooqId, positionForPath, previewForPath } from '@/core'
import { DbReadingHistoryEvent } from '@/backend/history'
import { booqDataForId, booqForId } from '@/backend/library'

export type BooqHistoryParent = DbReadingHistoryEvent
export const booqHistoryResolver: IResolvers<BooqHistoryParent> = {
    BooqHistory: {
        async booq(parent): Promise<BooqParent | undefined> {
            return booqDataForId(parent.booqId as BooqId)
        },
        async preview(parent, { length }) {
            const booq = await booqForId(parent.booqId as BooqId)
            if (!booq) {
                return undefined
            }
            const preview = previewForPath(booq.nodes, parent.path, length)
            return preview?.trim()?.substring(0, length)
        },
        async position(parent) {
            const booq = await booqForId(parent.booqId as BooqId)
            if (!booq) {
                return undefined
            }
            const position = positionForPath(booq.nodes, parent.path)
            return position
        },
    },
}
