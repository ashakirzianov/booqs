import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const CollectionQuery = gql`query Collection($name: String!) {
    collection(name: $name) {
        booqs {
            id
            title
            author
            cover(size: 120)
        }
    }
}`;
type CollectionData = {
    collection: {
        booqs: {
            __typename: 'Booq',
            id: string,
            title?: string,
            author?: string,
            cover?: string,
        }[],
    },
};
type CollectionItem = CollectionData['collection']['booqs'][number];

export function useCollection(name: string) {
    const { loading, data } = useQuery<CollectionData>(
        CollectionQuery,
        { variables: { name } }
    );
    return {
        loading,
        booqs: data?.collection?.booqs ?? [],
    };
}

const AddToCollectionMutation = gql`
mutation AddToCollection($name: String!, $booqId: ID!) {
    addToCollection(name: $name, booqId: $booqId)
}`;
type AddToCollectionData = {
    addToCollection: boolean,
};
export function useAddToCollection() {
    const [doAdd, { loading }] = useMutation<AddToCollectionData>(
        AddToCollectionMutation,
    );
    return {
        loading,
        addToCollection({ booqId, name, cover, title, author }: {
            booqId: string,
            name: string,
            title?: string,
            author?: string,
            cover?: string,
        }) {
            doAdd({
                variables: { name, booqId },
                optimisticResponse: { addToCollection: true },
                update(cache, { data }) {
                    if (data?.addToCollection) {
                        const stored = cache.readQuery<CollectionData>({
                            query: CollectionQuery,
                            variables: { name },
                        });
                        if (stored) {
                            stored.collection.booqs.push({
                                __typename: 'Booq',
                                id: booqId,
                                title, author, cover,
                            });
                            cache.writeQuery({
                                query: CollectionQuery,
                                variables: { name },
                                data: stored,
                            });
                        }
                    }
                }
            });
        },
    };
}

const RemoveFromCollectionMutation = gql`
mutation RemoveFromCollection($name: String!, $booqId: ID!) {
    removeFromCollection(name: $name, booqId: $booqId)
}`;
type RemoveFromCollectionData = {
    removeFromCollection: boolean,
};
export function useRemoveFromCollection() {
    const [doRemove, { loading }] = useMutation<RemoveFromCollectionData>(
        RemoveFromCollectionMutation,
    );
    return {
        loading,
        removeFromCollection({ booqId, name }: {
            booqId: string,
            name: string,
        }) {
            doRemove({
                variables: { name, booqId },
                optimisticResponse: { removeFromCollection: true },
                update(cache, { data }) {
                    if (data?.removeFromCollection) {
                        const stored = cache.readQuery<CollectionData>({
                            query: CollectionQuery,
                            variables: { name },
                        });
                        const booqs = (stored?.collection?.booqs ?? []).filter(b => b.id !== booqId);
                        cache.writeQuery<CollectionData>({
                            query: CollectionQuery,
                            variables: { name },
                            data: {
                                ...stored,
                                collection: {
                                    ...stored?.collection,
                                    booqs,
                                },
                            },
                        });
                    }
                },
            });
        },
    };
}
