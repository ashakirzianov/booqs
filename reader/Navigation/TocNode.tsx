import { pageForPosition, TocNode } from '@/application'
import { BooqLink } from '@/controls/Links'
import { meter } from '@/controls/theme'


export function TocNodeComp({
    booqId, node: { item: { path, title, position } },
}: {
    booqId: string,
    node: TocNode,
}) {
    return <>
        <BooqLink booqId={booqId} path={path}>
            <div className='content font-bold'>
                <span className='title'>{title ?? 'no-title'}</span>
                <span className='page'>{pageForPosition(position)}</span>
            </div>
        </BooqLink>
        <style jsx>{`
        .content {
            display: flex;
            flex-flow: row nowrap;
            flex: 1;
            justify-content: space-between;
        }
        .content:hover {
            color: var(--theme-highlight);
        }
        .page {
            margin-left: ${meter.regular};
        }
        `}</style>
    </>
}