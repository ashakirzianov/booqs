import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { BooqCard, BooqCardProps } from '../controls/BooqCard';

type Featured = {
    cards: BooqCardProps[],
    loading: boolean,
}
function useFeatured(): Featured {
    const { loading, data } = useQuery(
        gql`query Featured {
            featured(limit: 10) {
                title
                author
                cover(size: 210)
                tags {
                    tag
                    value
                }
            }
        }`);
    return {
        loading,
        cards: (data?.featured ?? []),
    };
}

export function Featured() {
    const { cards } = useFeatured();
    return <div>
        {
            cards.map(
                (card, idx) => <BooqCard key={idx} {...card} />
            )
        }
        <style jsx>{`
            div {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            `}</style>
    </div>;
}
