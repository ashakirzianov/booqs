'use client'
import { DeleteBody, DeleteResponse, GetResponse, PostBody, PostResponse } from '@/app/api/collections/[name]/route'
import { BooqId } from '@/core'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

export const READING_LIST_COLLECTION = 'reading-list'
export const UPLOADS_COLLECTION = 'uploads'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useCollection(name: string) {
    const key = `/api/collections/${name}`
    const { data, error, isLoading } = useSWR<GetResponse>(key, fetcher)

    const addMutation = useSWRMutation(
        key,
        async (url, { arg }: { arg: PostBody }) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(arg),
            })
            if (!res.ok) throw new Error('Failed to add to collection')
            return res.json() as Promise<PostResponse>
        }
    )

    const removeMutation = useSWRMutation(
        key,
        async (url, { arg }: { arg: DeleteBody }) => {
            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(arg),
            })
            if (!res.ok) throw new Error('Failed to remove from collection')
            return res.json() as Promise<DeleteResponse>
        }
    )

    return {
        ids: data?.booqIds ?? [] as BooqId[],
        isLoading,
        error,
        addToCollection(booqId: string) {
            addMutation.trigger({ booqId }, {
                optimisticData: currentData =>
                    currentData
                        ? { booqIds: [...new Set([...currentData.booqIds, booqId])] }
                        : { booqIds: [booqId] },
                rollbackOnError: true,
                populateCache: true,
            })
        },
        removeFromCollection(booqId: string) {
            removeMutation.trigger({ booqId }, {
                optimisticData: (currentData) =>
                ({
                    booqIds: (currentData?.booqIds ?? []).filter((id) => id !== booqId)
                }),
                rollbackOnError: true,
                populateCache: true,
            })
        },
    }
}