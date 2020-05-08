import React from 'react';
import { BooqCard } from './BooqCard';
import { BooqData } from './types';

export function Featured({ cards }: {
    cards: BooqData[],
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
