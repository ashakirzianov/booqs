'use client'
import { useAuth } from '@/application/auth'
import { useAddToCollection, useCollectionIds, useRemoveFromCollection } from '@/application/collections'
import { AppProvider } from '@/application/provider'

export function CollectionButton({ booqId, collection }: {
    booqId: string,
    collection?: string,
}) {
    let { signed } = useAuth() ?? {}
    if (!signed || !collection) {
        return null
    } else {
        return <CollectionButtonImpl booqId={booqId} collection={collection} />
    }
}

function CollectionButtonImpl({ booqId, collection }: {
    booqId: string,
    collection: string,
}) {
    let { ids, loading } = useCollectionIds(collection)
    let { addToCollection } = useAddToCollection(collection)
    let { removeFromCollection } = useRemoveFromCollection(collection)
    let inCollection = ids.includes(booqId)
    function toggle() {
        if (inCollection) {
            removeFromCollection(booqId)
        } else {
            addToCollection(booqId)
        }
    }
    if (loading) {
        return null
    }
    return <AppProvider>
        <span className='text-action underline text-lg cursor-pointer transition duration-300 hover:text-highlight' onClick={toggle}>
            {inCollection
                ? 'Remove'
                : 'Add'}
        </span>
    </AppProvider>
}