import React from 'react'
import { BooqPath, samePath } from '@/core'
import { useBookmarks, useBookmarkMutations, useAuth } from '@/application'
import { IconButton } from '@/controls/Buttons'

export function BookmarkButton({ booqId, path }: {
    booqId: string,
    path: BooqPath,
}) {
    const { signed } = useAuth() ?? {}
    const { bookmarks } = useBookmarks(booqId)
    const { addBookmark, removeBookmark } = useBookmarkMutations(booqId)
    if (signed) {
        return null
    }
    const current = bookmarks.find(b => samePath(b.path, path))
    return <IconButton
        icon={current ? 'bookmark-solid' : 'bookmark-empty'}
        onClick={() => {
            if (current) {
                removeBookmark(current.id)
            } else {
                addBookmark(path)
            }
        }}
    />
}