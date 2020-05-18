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
            id: string,
            title?: string,
            author?: string,
            cover?: string,
        }[],
    },
};
type CollectionItem = CollectionData['collection']['booqs'][number]
    & { __typename: 'Booq' };

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
        addToCollection({ booqId, name, cover }: {
            booqId: string,
            name: string,
            cover?: string,
        }) {
            doAdd({
                variables: { name, booqId },
                refetchQueries: [{
                    query: CollectionQuery,
                    variables: { name },
                }],
                awaitRefetchQueries: true,
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
