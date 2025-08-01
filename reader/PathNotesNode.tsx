import { Fragment } from 'react'
import { NoteNodeComp } from './NoteNode'
import { PathNotesNode } from './nodes'
import { booqHref } from '@/common/href'
import Link from 'next/link'
import { BooqId, TableOfContentsItem } from '@/core'
import { NoteAuthorData } from '@/data/notes'

export function PathNotesNodeComp({
    booqId, user,
    node: { items, notes },
}: {
    booqId: BooqId,
    user: NoteAuthorData | undefined,
    node: PathNotesNode,
}) {
    return <div>
        <Path booqId={booqId} items={items} />
        {
            notes.map(
                (hl) =>
                    <div key={hl.id} className='my-base'>
                        <NoteNodeComp
                            booqId={booqId}
                            user={user}
                            note={hl}
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
                        <Link href={booqHref({ booqId, path: item.path })}>
                            {item.title}
                        </Link>
                    </div>
                </Fragment>
            )
        }
    </div>
}