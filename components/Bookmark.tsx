import React from 'react';
import { useBookmarks, useBookmarkMutations, useAuth } from 'app';
import { IconButton } from 'controls/Buttons';
import { BooqPath, samePath } from 'core';

export function BookmarkButton({ booqId, path }: {
    booqId: string,
    path: BooqPath,
}) {
    const { state } = useAuth();
    const { bookmarks } = useBookmarks(booqId);
    const { addBookmark, removeBookmark } = useBookmarkMutations(booqId);
    if (state !== 'signed') {
        return null;
    }
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