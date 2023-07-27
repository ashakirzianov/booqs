import React from 'react'
import { TextButton } from '@/controls/Buttons'
import { FeaturedItem } from '@/application/featured'
import { useAddToCollection, useCollection, useRemoveFromCollection } from '@/application/collections'

export function AddToReadingListButton({ item }: {
    item: FeaturedItem,
}) {
    const { booqs } = useCollection('my-books')
    const { addToCollection, loading } = useAddToCollection()
    const { removeFromCollection } = useRemoveFromCollection()
    const isInReadingList = booqs.some(b => b.id === item.id)
    if (isInReadingList) {
        return <TextButton
            text="Remove"
            onClick={() => removeFromCollection({
                booqId: item.id,
                name: 'my-books',
            })}
        />
    } else {
        return <TextButton
            text="Add"
            onClick={() => addToCollection({
                name: 'my-books',
                booqId: item.id,
                title: item.title,
                author: item.author,
                cover: item.cover,
            })}
            loading={loading}
        />
    }
}