import React, { useState } from 'react';
import { IconButton } from 'controls/Buttons';
import { Modal } from 'controls/Modal';
import { useToc, TocItem } from 'app/toc';
import { Spinner } from 'controls/Spinner';
import { BooqPath, usePalette, pageForPosition } from 'app';
import { BooqLink } from 'controls/Links';
import { meter } from 'controls/theme';

export function TocButton({ booqId }: {
    booqId: string,
}) {
    const [open, setOpen] = useState(false);
    const { loading, items } = useToc(booqId);
    return <>
        <IconButton icon='toc' onClick={() => setOpen(true)} />
        <Modal
            isOpen={open}
            close={() => setOpen(false)}
            title='Contents'
        >
            {
                loading ? <Spinner /> :
                    <TocContent booqId={booqId} items={items} />
            }
        </Modal>
    </>;
}

const tocWidth = '50rem';
function TocContent({ booqId, items }: {
    booqId: string,
    items: TocItem[],
}) {
    const { background, highlight, border } = usePalette();
    return <div className='container'>
        {
            items.map(
                (item, idx) => <>
                    <div key={idx} className='item'>
                        <TocRow
                            booqId={booqId}
                            title={item.title}
                            path={item.path}
                            position={item.position}
                        />
                    </div>
                    <hr key={`${idx}-hr`} />
                </>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: column nowrap;
                width: 100vw;
                max-width: ${tocWidth};
            }
            .item:hover {
                color: ${background};
                background: ${highlight};
            }
            hr {
                width: 85%;
                border: none;
                border-top: 1px solid ${border};
            }
            `}</style>
    </div>;
}

function TocRow({
    booqId, title, path, position,
}: {
    booqId: string,
    title?: string,
    path: BooqPath,
    position?: number,
}) {
    return <>
        <BooqLink booqId={booqId} path={path}>
            <div className='content'>
                <span className='title'>{title ?? 'no-title'}</span>
                <span className='page'>{pageForPosition(position ?? 1)}</span>
            </div>
        </BooqLink>
        <style jsx>{`
        .content {
            display: flex;
            flex-flow: row nowrap;
            flex: 1;
            padding: ${meter.large};
            justify-content: space-between;
        }
        `}</style>
    </>;
}
