import { pageForPosition, TocNode } from '@/application'
import { BooqLink } from '@/controls/Links'


export function TocNodeComp({
    booqId, node: { item: { path, title, position } },
}: {
    booqId: string,
    node: TocNode,
}) {
    return <>
        <BooqLink booqId={booqId} path={path}>
            <div className='flex flex-nowrap flex-1 justify-between font-bold hover:text-highlight'>
                <span className='title'>{title ?? 'no-title'}</span>
                <span className='ml-base'>{pageForPosition(position)}</span>
            </div>
        </BooqLink>
    </>
}