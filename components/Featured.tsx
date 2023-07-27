import React from 'react'
import { TextButton } from '@/components/Buttons'
import { Panel } from '@/components/Panel'
import { BooqTags } from '@/components/BooqTags'
import { BooqCover } from '@/components/BooqCover'
import { BooqLink } from '@/components/Links'

type FeaturedItem = {
    id: string,
    title?: string,
    author?: string,
    cover?: string,
    tags: Array<{
        tag: string,
        value?: string,
    }>,
}
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
    return <div className='flex flex-col items-baseline'>
        <span className="text-xl font-bold">{title}</span>
        <span className="text-lg">by {author}</span>
    </div>
}

function Actions({ item }: {
    item: FeaturedItem,
}) {
    return <div className='flex self-stretch justify-end'>
        <div className='ml-xl'>
            <ReadButton item={item} />
        </div>
    </div>
}

function ReadButton({ item }: {
    item: FeaturedItem,
}) {
    return <BooqLink booqId={item.id} path={[0]}>
        <TextButton text="Read" />
    </BooqLink>
}
