import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { LinkButton } from '../controls/Buttons';
import { Panel } from '../controls/Panel';
import { BooqTags } from '../controls/BooqTags';
import { BooqCover } from '../controls/BooqCover';
import { boldWeight, meter } from '../controls/theme';
import { useAddToCollection, useCollection, useRemoveFromCollection } from '../app/collections';

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

function useFeatured() {
    const { loading, data } = useQuery<FeaturedData>(FeaturedQuery);
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
                (item, idx) => <FeaturedCard key={idx} item={item} />
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

type FeaturedItem = FeaturedData['featured'][number];
function FeaturedCard({
    item,
}: {
    item: FeaturedItem,
}) {
    return <Panel>
        <div className="container">
            <BooqCover
                title={item.title}
                author={item.author}
                cover={item.cover}
            />
            <div className="details">
                <div>
                    <Header title={item.title} author={item.author} />
                    <BooqTags tags={item.tags} />
                </div>
                <Actions item={item} />
            </div>
            <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                flex: 1;
                padding: ${meter.large};
            }
            .details {
                display: flex;
                flex-direction: column;
                flex: 1;
                justify-content: space-between;
                margin-left: ${meter.xxLarge};
            }
            `}</style>
        </div>
    </Panel>;
}

function Header({ title, author }: {
    title?: string,
    author?: string,
}) {
    return <div>
        <span className="title">{title}</span>
        <span className="author">by {author}</span>
        <style jsx>{`
            div {
                display: flex;
                flex-flow: column wrap;
                align-items: baseline;
            }
            .title {
                font-size: x-large;
                font-weight: ${boldWeight};
            }
            .author {
                font-size: large;
            }
            `}</style>
    </div>;
}

function Actions({ item }: {
    item: FeaturedItem,
}) {
    const { booqs } = useCollection('my-books');
    const { addToCollection } = useAddToCollection();
    return <div>
        <div>
            <AddToReadingListButton item={item} />
        </div>
        <div>
            <LinkButton text="Read &rarr;" />
        </div>
        <style jsx>{`
        div {
            display: flex;
            align-self: stretch;
            justify-content: flex-end;
        }
        div > * {
            margin: 0 0 0 ${meter.xLarge};
        }
        `}</style>
    </div>;
}

function AddToReadingListButton({ item }: {
    item: FeaturedItem,
}) {
    const { booqs } = useCollection('my-books');
    const { addToCollection, loading } = useAddToCollection();
    const { removeFromCollection } = useRemoveFromCollection();
    const isInReadingList = booqs.some(b => b.id === item.id);
    if (isInReadingList) {
        return <LinkButton
            text="Remove -"
            onClick={() => removeFromCollection({
                booqId: item.id,
                name: 'my-books',
            })}
        />;
    } else {
        return <LinkButton
            text="Add +"
            onClick={() => addToCollection({
                name: 'my-books',
                booqId: item.id,
                title: item.title,
                author: item.author,
                cover: item.cover,
            })}
            loading={loading}
        />;
    }
}
