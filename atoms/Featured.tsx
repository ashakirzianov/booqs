import React from 'react';
import { BooqCardProps, BooqCard } from './BooqCard';

export function Featured({ cards }: {
    cards: BooqCardProps[],
}) {
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
