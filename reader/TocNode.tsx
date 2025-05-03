import { pageForPosition } from '@/application/common'
import { TocNode } from './nodes'
import Link from 'next/link'
import { booqHref } from '@/application/href'


export function TocNodeComp({
    booqId, node: { item: { path, title, position } },
}: {
    booqId: string,
    node: TocNode,
}) {
    return <>
        <Link href={booqHref({ id: booqId, path })}>
            <div className='flex flex-nowrap flex-1 justify-between font-bold hover:text-highlight'>
                <span className='title'>{title ?? 'no-title'}</span>
                <span className='ml-base'>{pageForPosition(position)}</span>
            </div>
        </Link>
    </>
}