import { IResolvers } from '@graphql-tools/utils'
import { BookmarkParent } from './bookmark'
import { NoteParent } from './note'
import {
    BooqId, buildFragment, previewForPath, textForRange,
} from '@/core'
import { getBookmarks } from '@/backend/bookmarks'
import { notesFor } from '@/backend/notes'
import { booqForId } from '@/backend/library'

export type BooqParent = {
    kind?: 'booq' | undefined,
    booqId: BooqId,
}
export const booqResolver: IResolvers<BooqParent> = {
    Booq: {
        async bookmarks(parent, _, { user }): Promise<BookmarkParent[]> {
            return user
                ? getBookmarks({
                    userId: user.id,
                    booqId: parent.booqId,
                })
                : []
        },
        async notes(parent): Promise<NoteParent[]> {
            return notesFor({
                booqId: parent.booqId,
            })
        },
        async preview(parent, { path, end, length }) {
            const booq = await booqForId(parent.booqId)
            if (!booq) {
                return undefined
            }
            if (end) {
                const preview = textForRange(booq.nodes, { start: path ?? [], end })?.trim()
                return length
                    ? preview?.substring(0, length)
                    : preview
            } else {
                const preview = previewForPath(booq.nodes, path ?? [], length)
                return preview?.trim()?.substring(0, length)
            }
        },
        async nodes(parent) {
            const booq = await booqForId(parent.booqId)
            return booq
                ? booq.nodes
                : undefined
        },
        async fragment(parent, { path }) {
            const booq = await booqForId(parent.booqId)
            if (!booq) {
                return undefined
            }
            return buildFragment({
                booq,
                path,
            })
        },
        async tableOfContents(parent) {
            const booq = await booqForId(parent.booqId)
            return booq
                ? booq.toc.items
                : undefined
        },
    },
}
