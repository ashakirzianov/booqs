import React from 'react'
import {
    FeaturedItem,
    useAddToCollection, useCollection, useRemoveFromCollection,
} from '@/application'
import { TextButton } from '@/controls/Buttons'

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