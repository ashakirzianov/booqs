import React from 'react';
import { BooqCardProps, BooqCard } from './BooqCard';

export function Featured({ cards }: {
    cards: BooqCardProps[],
}) {
    return <div>
        <span>Featured</span>
        {
            cards.map(
                (card, idx) => <BooqCard key={idx} {...card} />
            )
        }
    </div>;
}
