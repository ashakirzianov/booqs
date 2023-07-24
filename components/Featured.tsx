import React from 'react'
import {
    useAddToCollection, useCollection, useRemoveFromCollection, useFeatured,
} from '@/application'
import { TextButton } from '@/controls/Buttons'
import { Panel } from '@/controls/Panel'
import { BooqTags } from '@/controls/BooqTags'
import { BooqCover } from '@/controls/BooqCover'
import { BooqLink } from '@/controls/Links'

export function Featured({ cards }: {
    cards: FeaturedItem[],
}) {
    return <div className='flex flex-col items-center'>
        {
            cards.map(
                (item, idx) => <FeaturedCard key={idx} item={item} />
            )
        }
    </div>
}

type FeaturedItem = ReturnType<typeof useFeatured>['cards'][number];
function FeaturedCard({
    item,
}: {
    item: FeaturedItem,
}) {
    return <Panel>
        <div className="flex flex-col grow items-center p-lg sm:flex-row sm:flex-wrap sm:items-stretch">
            <div className='flex m-base sm:my-base sm:mr-2xl sm:ml-0'>
                <BooqCover
                    title={item.title}
                    author={item.author}
                    cover={item.cover}
                />
            </div>
            <div className="flex flex-col flex-1 justify-between py-base px-0">
                <div className='header'>
                    <Header title={item.title} author={item.author} />
                </div>
                <div className='mt-lg'>
                    <BooqTags tags={item.tags} />
                </div>
                <div className='mt-lg'>
                    <Actions item={item} />
                </div>
            </div>
        </div>
    </Panel>
}

function Header({ title, author }: {
    title?: string,
    author?: string,
}) {
    return <div>
        <span className="text-xl font-bold">{title}</span>
        <span className="author">by {author}</span>
        <style jsx>{`
            div {
                display: flex;
                flex-flow: column wrap;
                align-items: baseline;
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
        <div className='ml-xl'>
            <ReadButton item={item} />
        </div>
        <style jsx>{`
        .container {
            display: flex;
            flex-flow: row wrap;
            align-self: stretch;
            justify-content: flex-end;
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
