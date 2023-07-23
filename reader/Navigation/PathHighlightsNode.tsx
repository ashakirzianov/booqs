import { Fragment } from 'react'
import { TocItem, UserInfo, PathHighlightsNode } from '@/application'
import { BooqLink } from '@/controls/Links'
import { meter } from '@/controls/theme'
import { HighlightNodeComp } from './HighlightNode'

export function PathHighlightsNodeComp({
    booqId, self,
    node: { items, highlights },
}: {
    booqId: string,
    self: UserInfo | undefined,
    node: PathHighlightsNode,
}) {
    return <div>
        <Path booqId={booqId} items={items} />
        {
            highlights.map(
                (hl) =>
                    <div key={hl.id} className='highlight'>
                        <HighlightNodeComp
                            booqId={booqId}
                            self={self}
                            highlight={hl}
                        />
                    </div>
            )
        }
        <style jsx>{`
            .highlight {
                margin: ${meter.regular} 0;
            }
            `}</style>
    </div>
}

function Path({ items, booqId }: {
    booqId: string,
    items: Array<TocItem | undefined>,
}) {
    return <div className='container'>
        {
            items.map((item, idx) => !item ? null
                : <Fragment key={idx}>
                    {idx === 0 ? null : <div className='separator'>/</div>}
                    <div className='element font-bold'>
                        <BooqLink booqId={booqId} path={item.path}>
                            {item.title}
                        </BooqLink>
                    </div>
                </Fragment>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: row wrap;
            }
            .element {
                margin: 0 ${meter.regular} 0 0;
            }
            .element:hover {
                text-decoration: underline;
            }
            .separator {
                margin: 0 ${meter.regular} 0 0;
            }
            `}</style>
    </div>
}