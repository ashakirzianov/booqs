import React from 'react';
import { useCollection } from '../app';
import { BooqCover } from '../controls/BooqCover';
import { Spinner } from '../controls/Spinner';
import { meter, panelShadow } from '../controls/theme';

export function Collection({ name }: {
    name: string,
    title: string,
}) {
    const { booqs, loading } = useCollection(name);
    return <div>
        {
            loading
                ? <Spinner />
                : <CollectionItems booqs={booqs} />
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

type CollectionItem = ReturnType<typeof useCollection>['booqs'][number];
function CollectionItems({ booqs }: {
    booqs: CollectionItem[],
}) {
    return <div className='container'>
        {
            booqs.map(
                (booq, idx) => <CollectionItemTile key={idx} {...booq} />,
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                overflow: scroll;
            }
            `}</style>
    </div>
}
function CollectionItemTile({
    title, author, cover,
}: CollectionItem) {
    return <div
        className='tile'
        title={composeTitle(title, author)}
    >
        <BooqCover
            title={title}
            author={author}
            cover={cover}
            size={40}
        />
        <style jsx>{`
            .tile {
                margin: ${meter.regular};
                box-shadow: ${panelShadow};
            }
            `}</style>
    </div>;
}

function composeTitle(title?: string, author?: string) {
    return title && author ? `${title} by ${author}`
        : title ? title
            : author ? author
                : 'no title';
}
