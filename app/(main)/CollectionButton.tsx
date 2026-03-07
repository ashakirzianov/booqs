'use client'
import React from 'react'
import { useCollection } from '@/application/collections'
import { BooqId } from '@/core'

export function CollectionButton({
    booqId,
    collection,
    AddButtonContent,
    RemoveButtonContent
}: {
    booqId: BooqId,
    collection: string,
    AddButtonContent: React.ReactNode,
    RemoveButtonContent: React.ReactNode,
}) {
    const {
        ids, isLoading,
        addToCollection, removeFromCollection,
    } = useCollection(collection)
    const inCollection = ids.includes(booqId)
    function toggle() {
        if (inCollection) {
            removeFromCollection(booqId)
        } else {
            addToCollection(booqId)
        }
    }
    if (isLoading) {
        return null
    }
    return <span className='text-action cursor-pointer transition-colors duration-300 hover:text-highlight font-bold' onClick={toggle}>
        {inCollection
            ? RemoveButtonContent
            : AddButtonContent}
    </span>
}