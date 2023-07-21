import React from 'react'
import {
    useAddToCollection, useCollection, useRemoveFromCollection, useFeatured,
} from '@/app'
import { TextButton } from '@/controls/Buttons'
import { Panel } from '@/controls/Panel'
import { BooqTags } from '@/controls/BooqTags'
import { BooqCover } from '@/controls/BooqCover'
import { boldWeight, meter } from '@/controls/theme'
import { BooqLink } from '@/controls/Links'

export function Featured({ cards }: {
    cards: FeaturedItem[],
}) {
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
    </div>
}

type FeaturedItem = ReturnType<typeof useFeatured>['cards'][number];
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
                flex-flow: column;
                flex: 1;
                padding: ${meter.large};
                align-items: center;
            }
            .cover {
                display: flex;
                margin: ${meter.regular};
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
            @media (min-width: 600px) {
                .container {
                    flex-flow: row wrap;
                    align-items: stretch;
                }
                .cover {
                    margin: ${meter.regular} ${meter.xxLarge} ${meter.regular} 0;
                }
            }
            `}</style>
        </div>
    </Panel>
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
    </div>
}

function Actions({ item }: {
    item: FeaturedItem,
}) {
    return <div className='container'>
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
    </div>
}

function ReadButton({ item }: {
    item: FeaturedItem,
}) {
    return <BooqLink booqId={item.id} path={[0]}>
        <TextButton text="Read" />
    </BooqLink>
}

function AddToReadingListButton({ item }: {
    item: FeaturedItem,
}) {
    const { booqs } = useCollection('my-books')
    const { addToCollection, loading } = useAddToCollection()
    const { removeFromCollection } = useRemoveFromCollection()
    const isInReadingList = booqs.some(b => b.id === item.id)
    if (isInReadingList) {
        return <TextButton
            text="Remove"
            onClick={() => removeFromCollection({
                booqId: item.id,
                name: 'my-books',
            })}
        />
    } else {
        return <TextButton
            text="Add"
            onClick={() => addToCollection({
                name: 'my-books',
                booqId: item.id,
                title: item.title,
                author: item.author,
                cover: item.cover,
            })}
            loading={loading}
        />
    }
}
