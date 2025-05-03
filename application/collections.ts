'use client'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

export const READING_LIST_COLLECTION = 'reading-list'
export const UPLOADS_COLLECTION = 'uploads'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useCollection(name: string) {
    type CollectionData = { ids: string[] }
    type MutationArg = { booqId: string }
    const key = `/api/collections/${name}`
    const { data, error, isLoading } = useSWR<CollectionData>(key, fetcher)

    const addMutation = useSWRMutation(
        key,
        async (url, { arg }: { arg: MutationArg }) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(arg),
            })
            if (!res.ok) throw new Error('Failed to add to collection')
            return res.json() as Promise<CollectionData>
        }
    )

    const removeMutation = useSWRMutation(
        key,
        async (url, { arg }: { arg: MutationArg }) => {
            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(arg),
            })
            if (!res.ok) throw new Error('Failed to remove from collection')
            return res.json() as Promise<CollectionData>
        }
    )

    return {
        ids: data?.ids ?? [],
        isLoading,
        error,
        addToCollection(booqId: string) {
            addMutation.trigger({ booqId }, {
                optimisticData: currentData =>
                    currentData
                        ? { ids: [...new Set([...currentData.ids, booqId])] }
                        : { ids: [booqId] },
                rollbackOnError: true,
                populateCache: true,
            })
        },
        removeFromCollection(booqId: string) {
            removeMutation.trigger({ booqId }, {
                optimisticData: (currentData) =>
                ({
                    ids: (currentData?.ids ?? []).filter((id) => id !== booqId)
                }),
                rollbackOnError: true,
                populateCache: true,
            })
        },
    }
}