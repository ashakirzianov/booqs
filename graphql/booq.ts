import { IResolvers } from '@graphql-tools/utils'
import { BookmarkParent } from './bookmark'
import { NoteParent } from './note'
import { ResolverContext } from './context'
import {
    BooqId, buildChapter, previewForPath, textForRange,
} from '@/core'
import { getBookmarks } from '@/backend/bookmarks'
import { notesWithAuthorFor } from '@/backend/notes'
import { userForUsername } from '@/backend/users'

export type BooqParent = {
    kind?: 'booq' | undefined,
    booqId: BooqId,
    title?: string,
    authors?: string[],
    subjects?: string[],
    coverSrc?: string,
}
export const booqResolver: IResolvers<BooqParent, ResolverContext> = {
    Booq: {
        id(parent) {
            return parent.booqId
        },
        title(parent) {
            return parent.title
        },
        authors(parent) {
            return parent.authors
        },
        subjects(parent) {
            return parent.subjects
        },
        coverSrc(parent) {
            return parent.coverSrc
        },
        async bookmarks(parent, _, { userId }): Promise<BookmarkParent[]> {
            return userId
                ? getBookmarks({
                    userId,
                    booqId: parent.booqId,
                })
                : []
        },
        async notes(parent, { username, limit, offset }: {
            username?: string, limit?: number, offset?: number,
        }, { userId }): Promise<NoteParent[]> {
            let authorId: string | undefined
            if (username) {
                const user = await userForUsername(username)
                if (!user) return []
                authorId = user.id
            }
            return notesWithAuthorFor({ booqId: parent.booqId, authorId, userId, limit, offset })
        },
        async preview(parent, { path, end, length }, { booqLoader }) {
            const booq = await booqLoader.load(parent.booqId)
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
        async nodes(parent, _, { booqLoader }) {
            const booq = await booqLoader.load(parent.booqId)
            return booq
                ? booq.nodes
                : undefined
        },
        async styles(parent, _, { booqLoader }) {
            const booq = await booqLoader.load(parent.booqId)
            return booq
                ? booq.styles
                : undefined
        },
        async chapter(parent, { path }, { booqLoader }) {
            const booq = await booqLoader.load(parent.booqId)
            if (!booq) {
                return undefined
            }
            return buildChapter({ booq, path })
        },
        async tableOfContents(parent, _, { booqLoader }) {
            const booq = await booqLoader.load(parent.booqId)
            return booq
                ? booq.toc.items
                : undefined
        },
    },
}
