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
        addToCollection(booqId: string, name: string) {
            doAdd({
                variables: { name, booqId },
                refetchQueries: [{
                    query: CollectionQuery,
                    variables: { name },
                }],
            });
        },
    };
}
