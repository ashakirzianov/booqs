import { Fragment } from 'react'
import { HighlightNodeComp } from './HighlightNode'
import { PathHighlightsNode } from './nodes'
import { booqHref } from '@/application/href'
import Link from 'next/link'
import { AccountDisplayData, TableOfContentsItem } from '@/core'

export function PathHighlightsNodeComp({
    booqId, self,
    node: { items, highlights },
}: {
    booqId: string,
    self: AccountDisplayData | undefined,
    node: PathHighlightsNode,
}) {
    return <div>
        <Path booqId={booqId} items={items} />
        {
            highlights.map(
                (hl) =>
                    <div key={hl.id} className='my-base'>
                        <HighlightNodeComp
                            booqId={booqId}
                            self={self}
                            highlight={hl}
                        />
                    </div>
            )
        }
    </div>
}

function Path({ items, booqId }: {
    booqId: string,
    items: Array<TableOfContentsItem | undefined>,
}) {
    return <div className='flex flex-wrap'>
        {
            items.map((item, idx) => !item ? null
                : <Fragment key={idx}>
                    {idx === 0 ? null : <div className='mr-base'>/</div>}
                    <div className='font-bold mr-base hover:underline'>
                        <Link href={booqHref({ id: booqId, path: item.path })}>
                            {item.title}
                        </Link>
                    </div>
                </Fragment>
            )
        }
    </div>
}