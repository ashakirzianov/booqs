import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const FeaturedQuery = gql`query Featured {
    featured(limit: 10) {
        id
        title
        author
        cover(size: 210)
        tags {
            tag
            value
        }
    }
}`;
type FeaturedData = {
    featured: {
        id: string,
        title?: string,
        author?: string,
        cover?: string,
        tags: {
            tag: string,
            value?: string,
        }[],
    }[],
};

export function useFeatured() {
    const { loading, data } = useQuery<FeaturedData>(FeaturedQuery);
    return {
        loading,
        cards: (data?.featured ?? []),
    };
}