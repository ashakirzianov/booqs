import React from 'react'
import { BooqCover } from '@/components/BooqCover'
import { Spinner } from '@/components/Loading'
import { useCollection } from '@/application/collections'

export function Collection({ name }: {
    name: string,
    title: string,
}) {
    const { booqs, loading } = useCollection(name)
    return <div className='flex flex-col items-center'>
        {
            loading
                ? <Spinner />
                : <CollectionItems booqs={booqs} />
        }
    </div>
}

type CollectionItem = ReturnType<typeof useCollection>['booqs'][number];
function CollectionItems({ booqs }: {
    booqs: CollectionItem[],
}) {
    return <div className='flex overflow-auto'>
        {
            booqs.map(
                (booq, idx) => <CollectionItemTile key={idx} {...booq} />,
            )
        }
    </div>
}
function CollectionItemTile({
    title, author, cover,
}: CollectionItem) {
    return <div
        className='m-base shadow'
        title={composeTitle(title, author)}
    >
        <BooqCover
            title={title}
            author={author}
            cover={cover}
            size={40}
        />
    </div>
}

function composeTitle(title?: string, author?: string) {
    return title && author ? `${title} by ${author}`
        : title ? title
            : author ? author
                : 'no title'
}
