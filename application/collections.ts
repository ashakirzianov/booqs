import { useQuery, useMutation, gql } from '@apollo/client'

export const READING_LIST_COLLECTION = 'reading-list'
export const UPLOADS_COLLECTION = 'uploads'

const CollectionIdsQuery = gql`query CollectionIds($name: String!) {
    collection(name: $name) {
        booqs {
            id
        }
    }
}`
type CollectionIdsData = {
    collection: {
        booqs: {
            id: string,
        }[],
    },
}
type CollectionIdsVars = {
    name: string,
}
export function useCollectionIds(name: string) {
    const { loading, data } = useQuery<CollectionIdsData, CollectionIdsVars>(
        CollectionIdsQuery,
        { variables: { name } }
    )
    let ids = data?.collection?.booqs.map(b => b.id) ?? []
    return {
        loading,
        ids,
    }
}

const AddToCollectionMutation = gql`
mutation AddToCollection($name: String!, $booqId: ID!) {
    addToCollection(name: $name, booqId: $booqId)
}`
type AddToCollectionData = {
    addToCollection: boolean,
};
export function useAddToCollection(name: string) {
    const [doAdd, { loading }] = useMutation<AddToCollectionData>(
        AddToCollectionMutation,
    )
    return {
        loading,
        addToCollection(booqId: string) {
            doAdd({
                variables: { name, booqId },
                optimisticResponse: { addToCollection: true },
                update(cache, { data }) {
                    if (data?.addToCollection) {
                        let cached = cache.readQuery<CollectionIdsData, CollectionIdsVars>({
                            query: CollectionIdsQuery,
                            variables: { name },
                        })
                        if (cached) {
                            let item = {
                                __typename: 'Booq',
                                id: booqId,
                            } as const
                            cached = {
                                ...cached,
                                collection: {
                                    ...cached.collection,
                                    booqs: [item, ...cached.collection.booqs],
                                },
                            }
                            cache.writeQuery({
                                query: CollectionIdsQuery,
                                variables: { name },
                                data: cached,
                            })
                        }
                    }
                }
            })
        },
    }
}

const RemoveFromCollectionMutation = gql`
mutation RemoveFromCollection($name: String!, $booqId: ID!) {
    removeFromCollection(name: $name, booqId: $booqId)
}`
type RemoveFromCollectionData = {
    removeFromCollection: boolean,
};
export function useRemoveFromCollection(name: string) {
    const [doRemove, { loading }] = useMutation<RemoveFromCollectionData>(
        RemoveFromCollectionMutation,
    )
    return {
        loading,
        removeFromCollection(booqId: string) {
            doRemove({
                variables: { name, booqId },
                optimisticResponse: { removeFromCollection: true },
                update(cache, { data }) {
                    if (data?.removeFromCollection) {
                        const stored = cache.readQuery<CollectionIdsData, CollectionIdsVars>({
                            query: CollectionIdsQuery,
                            variables: { name },
                        })
                        const booqs = (stored?.collection?.booqs ?? []).filter(b => b.id !== booqId)
                        cache.writeQuery<CollectionIdsData, CollectionIdsVars>({
                            query: CollectionIdsQuery,
                            variables: { name },
                            data: {
                                ...stored,
                                collection: {
                                    ...stored?.collection,
                                    booqs,
                                },
                            },
                        })
                    }
                },
            })
        },
    }
}
