import { Fragment } from 'react'
import { BooqLink } from '@/components/Links'
import { HighlightNodeComp } from './HighlightNode'
import { ReaderTocItem, ReaderUser } from './common'
import { PathHighlightsNode } from './nodes'

export function PathHighlightsNodeComp({
    booqId, self,
    node: { items, highlights },
}: {
    booqId: string,
    self: ReaderUser | undefined,
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
    items: Array<ReaderTocItem | undefined>,
}) {
    return <div className='flex flex-wrap'>
        {
            items.map((item, idx) => !item ? null
                : <Fragment key={idx}>
                    {idx === 0 ? null : <div className='mr-base'>/</div>}
                    <div className='font-bold mr-base hover:underline'>
                        <BooqLink booqId={booqId} path={item.path}>
                            {item.title}
                        </BooqLink>
                    </div>
                </Fragment>
            )
        }
    </div>
}