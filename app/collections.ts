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
            title: string | null,
            author: string | null,
            cover: string | null,
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
        addToCollection({ booqId, name, cover }: {
            booqId: string,
            name: string,
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
                        const added: CollectionItem = {
                            id: booqId,
                            cover: cover ?? null,
                            title: null,
                            author: null,
                        };
                        const booqs = [...stored?.collection?.booqs ?? [], added];
                        console.log(booqId, name, cover);
                        cache.writeQuery<CollectionData>({
                            query: CollectionQuery,
                            variables: { name },
                            data: {
                                collection: { booqs },
                            },
                        });
                    }
                },
            });
        },
    };
}
