import React from 'react';
import { BooqPath, samePath, useBookmarks, useBookmarkMutations } from 'app';
import { IconButton } from 'controls/Buttons';

export function BookmarkButton({ booqId, path }: {
    booqId: string,
    path: BooqPath,
}) {
    const { bookmarks } = useBookmarks(booqId);
    const { addBookmark, removeBookmark } = useBookmarkMutations(booqId);
    const current = bookmarks.find(b => samePath(b.path, path));
    return <IconButton
        icon={current ? 'bookmark-solid' : 'bookmark-empty'}
        onClick={() => {
            if (current) {
                removeBookmark(current.id);
            } else {
                addBookmark(path);
            }
        }}
    />;
}