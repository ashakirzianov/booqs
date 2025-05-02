'use client'
import React from 'react'
import { BooqPath, samePath } from '@/core'
import { useAuth } from '@/application/auth'
import { useBookmarkMutations, useBookmarks } from '@/application/bookmarks'
import { BookmarkIcon } from './Icons'
import { PanelButton } from './Buttons'

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
    return <PanelButton
        onClick={() => {
            if (current) {
                removeBookmark(current.id)
            } else {
                addBookmark(path)
            }
        }}
    >
        <BookmarkIcon filled={!!current} />
    </PanelButton>
}