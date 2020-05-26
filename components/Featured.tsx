import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { LinkButton } from '../controls/Buttons';
import { Panel } from '../controls/Panel';
import { BooqTags } from '../controls/BooqTags';
import { BooqCover } from '../controls/BooqCover';
import { boldWeight, meter } from '../controls/theme';
import { useAddToCollection, useCollection, useRemoveFromCollection } from '../app';
import { booqHref } from '../app';

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
            <div className='cover'>
                <BooqCover
                    title={item.title}
                    author={item.author}
                    cover={item.cover}
                />
            </div>
            <div className="details">
                <div className='header'>
                    <Header title={item.title} author={item.author} />
                </div>
                <div className='tags'>
                    <BooqTags tags={item.tags} />
                </div>
                <div className='actions'>
                    <Actions item={item} />
                </div>
            </div>
            <style jsx>{`
            .container {
                display: flex;
                flex-flow: row wrap;
                flex: 1;
                padding: ${meter.large};
            }
            .cover {
                display: flex;
                margin: ${meter.regular} ${meter.xxLarge} ${meter.regular} 0;
            }
            .details {
                display: flex;
                flex-direction: column;
                flex: 1;
                justify-content: space-between;
                margin: ${meter.regular} 0 ${meter.regular} 0;
            }
            .tags {
                margin: ${meter.large} 0 0 0;
            }
            .actions {
                margin: ${meter.large} 0 0 0;
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
    return <div className='container'>
        <div className='button'>
            <AddToReadingListButton item={item} />
        </div>
        <div className='button'>
            <ReadButton item={item} />
        </div>
        <style jsx>{`
        .container {
            display: flex;
            flex-flow: row wrap;
            align-self: stretch;
            justify-content: flex-end;
        }
        .button {
            margin: 0 0 0 ${meter.xLarge};
        }
        `}</style>
    </div>;
}

function ReadButton({ item }: {
    item: FeaturedItem,
}) {
    return <Link href={booqHref(item.id, [0])}>
        <LinkButton text="Read &rarr;" />
    </Link>;
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
