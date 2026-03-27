import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { ResolverContext } from './context'
import { DbNote } from '@/backend/notes'
import { DbUser } from '@/backend/users'
import {
    BooqId, positionForPath, textForRange,
    getExpandedRange, nodesForRange, collectReferencedStyles,
} from '@/core'

export type NoteParent = DbNote
export const noteResolver: IResolvers<NoteParent, ResolverContext> = {
    Note: {
        async author(parent, _, { userLoader }): Promise<DbUser | null> {
            return userLoader.load(parent.author_id)
        },
        async booq(parent, _, { booqDataLoader }): Promise<BooqParent | undefined> {
            return booqDataLoader.load(parent.booq_id as BooqId)
        },
        async text(parent, _, { booqLoader }) {
            const booq = await booqLoader.load(parent.booq_id as BooqId)
            if (booq) {
                const text = textForRange(booq.nodes, {
                    start: parent.start_path,
                    end: parent.end_path,
                })
                return text ?? '<no-text>'
            }
            return '<no-booq>'
        },
        async surroundingFragment(parent, _, { booqLoader }) {
            const booq = await booqLoader.load(parent.booq_id as BooqId)
            if (!booq) {
                return undefined
            }
            const expandedRange = getExpandedRange(booq.nodes, {
                start: parent.start_path,
                end: parent.end_path,
            })
            const nodes = nodesForRange(booq.nodes, expandedRange)
            const styles = collectReferencedStyles(nodes, booq.styles)
            return {
                start: expandedRange.start,
                end: expandedRange.end,
                nodes,
                styles,
            }
        },
        async position(parent, _, { booqLoader }) {
            const booq = await booqLoader.load(parent.booq_id as BooqId)
            if (!booq) {
                return undefined
            }
            const position = positionForPath(booq.nodes, parent.start_path)
            return position
        },
        start(parent) {
            return parent.start_path
        },
        end(parent) {
            return parent.end_path
        },
        targetQuote(parent) {
            return parent.target_quote
        },
        content(parent) {
            return parent.content
        },
        privacy(parent) {
            return parent.privacy
        },
        createdAt(parent) {
            return parent.created_at
        },
        updatedAt(parent) {
            return parent.updated_at
        },
    },
}
