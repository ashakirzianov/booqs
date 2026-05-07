import { Fragment } from 'react'
import { AnnotationNodeComp } from './AnnotationNode'
import { PathNotesNode } from './nodes'
import { booqContentHref } from '@/common/href'
import Link from 'next/link'
import { BooqId, TableOfContentsItem } from '@/core'
import { AnnotationAuthorData } from '@/data/annotations'

export function PathNotesNodeComp({
    booqId, user,
    node: { items, annotations },
}: {
    booqId: BooqId,
    user: AnnotationAuthorData | undefined,
    node: PathNotesNode,
}) {
    return <div>
        <Path booqId={booqId} items={items} />
        {
            annotations.map(
                (hl) =>
                    <div key={hl.id} className='my-base'>
                        <AnnotationNodeComp
                            booqId={booqId}
                            user={user}
                            annotation={hl}
                        />
                    </div>
            )
        }
    </div>
}

function Path({ items, booqId }: {
    booqId: BooqId,
    items: Array<TableOfContentsItem | undefined>,
}) {
    return <div className='flex flex-wrap'>
        {
            items.map((item, idx) => !item ? null
                : <Fragment key={idx}>
                    {idx === 0 ? null : <div className='mr-base'>/</div>}
                    <div className='font-bold mr-base hover:underline'>
                        <Link href={booqContentHref({ booqId, path: item.path })}>
                            {item.title}
                        </Link>
                    </div>
                </Fragment>
            )
        }
    </div>
}