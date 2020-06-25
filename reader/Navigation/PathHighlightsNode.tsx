import { TocItem, UserData, PathHighlightsNode } from 'app';
import { BooqLink } from 'controls/Links';
import { meter, boldWeight } from 'controls/theme';
import { HighlightNodeComp } from './HighlightNode';

export function PathHighlightsNodeComp({
    booqId, self,
    node: { items, highlights },
}: {
    booqId: string,
    self: UserData | undefined,
    node: PathHighlightsNode,
}) {
    return <div>
        <Path booqId={booqId} items={items} />
        {
            highlights.map(
                (hl, idx) =>
                    <div key={idx} className='highlight'>
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
    </div>;
}

function Path({ items, booqId }: {
    booqId: string,
    items: Array<TocItem | undefined>,
}) {
    return <div className='container'>
        {
            items.map((item, idx) => !item ? null
                : <>
                    {idx === 0 ? null : <div key='separator' className='separator'>/</div>}
                    <div key={idx} className='element'>
                        <BooqLink booqId={booqId} path={item.path}>
                            {item.title}
                        </BooqLink>
                    </div>
                </>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: row wrap;
            }
            .element {
                margin: 0 ${meter.regular} 0 0;
                font-weight: ${boldWeight};
            }
            .element:hover {
                text-decoration: underline;
            }
            .separator {
                margin: 0 ${meter.regular} 0 0;
            }
            `}</style>
    </div>;
}