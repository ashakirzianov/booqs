import { useQuery, useMutation, gql } from '@apollo/client'
import { BooqPath, uniqueId } from '@/core'

const BookmarksQuery = gql`query BookmarksQuery($booqId: ID!) {
    booq(id: $booqId) {
        id
        bookmarks {
            id
            path
        }
    }
}`
type BookmarksData = {
    booq: {
        bookmarks: {
            __typename: 'Bookmark',
            id: string,
            path: BooqPath,
        }[],
    },
};
export type Bookmark = BookmarksData['booq']['bookmarks'][number];

export function useBookmarks(booqId: string) {
    const { loading, data } = useQuery<BookmarksData>(
        BookmarksQuery,
        { variables: { booqId } },
    )
    return {
        loading,
        bookmarks: data?.booq.bookmarks ?? [],
    }
}

const AddBookmarkMutation = gql`mutation AddBookmark($bookmark: BookmarkInput!) {
    addBookmark(bookmark: $bookmark)
}`
type AddBookmarkData = { addBookmark: boolean };
type AddBookmarkVariables = {
    bookmark: { id: string, booqId: string, path: BooqPath },
};
const RemoveBookmarkMutation = gql`mutation RemoveBookmark($id: ID!) {
    removeBookmark(id: $id)
}`
type RemoveBookmarkData = { removeBookmark: boolean };
type RemoveBookmarkVariables = { id: string };
export function useBookmarkMutations(booqId: string) {
    const [add] = useMutation<AddBookmarkData, AddBookmarkVariables>(
        AddBookmarkMutation,
    )
    const [remove] = useMutation<RemoveBookmarkData, RemoveBookmarkVariables>(
        RemoveBookmarkMutation,
    )
    return {
        addBookmark(path: BooqPath) {
            const id = uniqueId()
            add({
                variables: { bookmark: { path, booqId, id } },
                optimisticResponse: { addBookmark: true },
                update(cache, { data }) {
                    if (data?.addBookmark) {
                        let cached = cache.readQuery<BookmarksData>({
                            query: BookmarksQuery,
                            variables: { booqId },
                        })
                        if (cached) {
                            let bm = {
                                __typename: 'Bookmark',
                                id, path,
                            } as const
                            cached = {
                                ...cached,
                                booq: {
                                    ...cached.booq,
                                    bookmarks: [bm, ...cached.booq.bookmarks],
                                },
                            }
                            cache.writeQuery({
                                query: BookmarksQuery,
                                variables: { booqId },
                                data: cached,
                            })
                        }
                    }
                },
            })
        },
        removeBookmark(id: string) {
            remove({
                variables: { id },
                optimisticResponse: { removeBookmark: true },
                update(cache, { data }) {
                    if (data?.removeBookmark) {
                        let cached = cache.readQuery<BookmarksData>({
                            query: BookmarksQuery,
                            variables: { booqId },
                        })
                        if (cached) {
                            cached = {
                                ...cached,
                                booq: {
                                    ...cached.booq,
                                    bookmarks: cached.booq.bookmarks.filter(
                                        bm => bm.id !== id,
                                    ),
                                },
                            }
                            cache.writeQuery({
                                query: BookmarksQuery,
                                variables: { booqId },
                                data: cached,
                            })
                        }
                    }
                },
            })
        },
    }
}