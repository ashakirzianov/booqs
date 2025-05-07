import { IResolvers } from '@graphql-tools/utils'
import { BookmarkParent } from './bookmark'
import { NoteParent } from './note'
import { booqImageUrl } from '@/backend/images'
import {
    BooqLibraryCard, buildFragment, previewForPath, textForRange,
} from '@/core'
import { getBookmarks } from '@/backend/bookmarks'
import { notesFor } from '@/backend/notes'
import { booqForId } from '@/backend/booq'

export type BooqParent = BooqLibraryCard & {
    kind?: undefined,
}
export const booqResolver: IResolvers<BooqParent> = {
    Booq: {
        coverUrl(parent, { size }) {
            return parent.coverUrl
                ? booqImageUrl(parent.id, parent.coverUrl, size)
                : undefined
        },
        tags(parent) {
            return buildTags(parent)
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
function buildTags(card: BooqParent): Tag[] {
    return [
        {
            tag: 'pages',
            value: Math.floor(card.length / 1500).toString(),
        },
        !card.id.startsWith('pg/') ? undefined :
            {
                tag: 'pg-index',
                value: card.id.substring('pg/'.length),
            },
    ].filter(tag => tag !== undefined)
}
