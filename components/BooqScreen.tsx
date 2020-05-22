import React from 'react';
import { Booq } from '../app';
import { bookFont } from '../controls/theme';
import { BooqContent } from './BooqContent';

export function BooqScreen({ booq }: {
    booq: Booq,
}) {
    return <div className='container'>
        <Content booq={booq} />
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: column;
                align-items: center;
            }
            `}</style>
    </div>;
}

const contentWidth = '50rem';
function Content({ booq }: {
    booq: Booq,
}) {
    const nodes = booq.nodesConnection.edges.map(e => e.node);
    return <div className='container'>
        <BooqContent nodes={nodes} />
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: column;
                align-items: center;
                width: 100%;
                max-width: ${contentWidth};
                font-family: ${bookFont};
            }
            `}</style>
    </div>;
}
