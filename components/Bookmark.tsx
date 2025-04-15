'use client'
import React from 'react'
import { BooqPath, samePath } from '@/core'
import { IconButton } from '@/components/Buttons'
import { useAuth } from '@/application/auth'
import { useBookmarkMutations, useBookmarks } from '@/application/bookmarks'

export function BookmarkButton({ booqId, path }: {
    booqId: string,
    path: BooqPath,
}) {
    const { auth } = useAuth()
    const { bookmarks } = useBookmarks(booqId)
    const { addBookmark, removeBookmark } = useBookmarkMutations(booqId)
    if (auth.state !== 'signed') {
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