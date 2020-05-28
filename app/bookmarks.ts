import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { BooqPath } from "./core";

const BookmarksQuery = gql`query BookmarksQuery($booqId: ID!) {
    booq(id: $booqId) {
        bookmarks {
            id
            path
        }
    }
}`;
type BookmarksData = {
    booq: {
        bookmarks: {
            __typename: 'Bookmark',
            id: string,
            path: BooqPath,
        }[],
    },
};

export function useBookmarks(booqId: string) {
    const { loading, data } = useQuery<BookmarksData>(
        BookmarksQuery,
        { variables: { booqId } },
    );
    return {
        loading,
        bookmarks: data?.booq.bookmarks ?? [],
    };
}

const AddBookmarkMutation = gql`mutation AddBookmark($bookmark: BookmarkInput) {
    addBookmark(bookmark: $bookmark)
}`;
type AddBookmarkData = { addBookmark: boolean };
type AddBookmarkVariables = {
    bookmark: { id: string, booqId: string, path: BooqPath },
};
type BookmarkInput = AddBookmarkVariables['bookmark'];
export function useBookmarkMutations() {
    const [add] = useMutation<AddBookmarkData, AddBookmarkVariables>(
        AddBookmarkMutation,
    );
    return {
        addBookmark(bookmark: BookmarkInput) {
            add({
                variables: { bookmark },
                optimisticResponse: { addBookmark: true },
                update(cache, { data }) {
                    if (data?.addBookmark) {
                        const cached = cache.readQuery<BookmarksData>({
                            query: BookmarksQuery,
                            variables: { booqId: bookmark.booqId },
                        });
                        if (cached) {
                            cached.booq.bookmarks.push({
                                __typename: 'Bookmark',
                                id: bookmark.id,
                                path: bookmark.path,
                            });
                        }
                    }
                },
            });
        },
    };
}