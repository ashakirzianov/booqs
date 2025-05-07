import { IResolvers } from '@graphql-tools/utils'
import { BookmarkParent } from './bookmark'
import { NoteParent } from './note'
import { booqImageUrl } from '@/backend/images'
import {
    BooqId,
    BooqLibraryCard,
    buildFragment, previewForPath, textForRange,
} from '@/core'
import { getBookmarks } from '@/backend/bookmarks'
import { notesFor } from '@/backend/notes'
import { booqForId } from '@/backend/booq'
import { libraryCardForId } from '@/backend/library'

export type BooqParent = {
    kind?: 'booq' | undefined,
    id: BooqId,
    coverSrc?: string | undefined,
}
export const booqResolver: IResolvers<BooqParent> = {
    Booq: {
        coverUrl(parent, { size }) {
            return parent.coverSrc
                ? booqImageUrl(parent.id, parent.coverSrc, size)
                : undefined
        },
        async tags(parent) {
            const card = await libraryCardForId(parent.id)
            if (!card) {
                return undefined
            }
            return buildTags(card)
        },
        async bookmarks(parent, _, { user }): Promise<BookmarkParent[]> {
            return user
                ? getBookmarks({
                    userId: user.id,
                    booqId: parent.id,
                })
                : []
        },
        async notes(parent): Promise<NoteParent[]> {
            return notesFor({
                booqId: parent.id,
            })
        },
        async preview(parent, { path, end, length }) {
            const booq = await booqForId(parent.id)
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
            const booq = await booqForId(parent.id)
            return booq
                ? booq.nodes
                : undefined
        },
        async fragment(parent, { path }) {
            const booq = await booqForId(parent.id)
            if (!booq) {
                return undefined
            }
            return buildFragment({
                booq,
                path,
            })
        },
        async tableOfContents(parent) {
            const booq = await booqForId(parent.id)
            return booq
                ? booq.toc.items
                : undefined
        },
    },
}

type Tag = {
    tag: string,
    value?: string | null,
}
function buildTags(card: BooqLibraryCard): Tag[] {
    return [
        {
            tag: 'pages',
            value: Math.floor(card.length / 1500).toString(),
        },
        ...(card.tags ?? []).map(([tag, value]) => ({
            tag, value,
        }))
    ].filter(tag => tag !== undefined)
}
