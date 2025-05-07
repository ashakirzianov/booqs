import { IResolvers } from '@graphql-tools/utils'
import { BooqParent } from './booq'
import { DbNote } from '@/backend/notes'
import { DbUser, userForId } from '@/backend/users'
import { libraryCardForId } from '@/backend/library'
import { BooqId, positionForPath, textForRange } from '@/core'
import { booqForId } from '@/backend/booq'

export type NoteParent = DbNote
export const noteResolver: IResolvers<NoteParent> = {
    Note: {
        async author(parent): Promise<DbUser | null> {
            return userForId(parent.author_id)
        },
        async booq(parent): Promise<BooqParent | undefined> {
            return libraryCardForId(parent.booq_id)
        },
        async text(parent) {
            const booq = await booqForId(parent.booq_id as BooqId)
            if (booq) {
                const text = textForRange(booq.nodes, {
                    start: parent.start_path,
                    end: parent.end_path,
                })
                return text ?? '<no-text>'
            }
            return '<no-booq>'
        },
        async position(parent) {
            const booq = await booqForId(parent.booq_id as BooqId)
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
    },
}
