import React, { useState } from 'react';
import { BooqPath } from 'core';
import { usePalette, pageForPosition, useToc, TocItem } from 'app';
import { IconButton } from 'controls/Buttons';
import { Modal } from 'controls/Modal';
import { Spinner } from 'controls/Spinner';
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
                (item, idx) => <div key={idx}>
                    <div className='item'>
                        <TocRow
                            booqId={booqId}
                            title={item.title}
                            path={item.path}
                            position={item.position}
                            ident={item.level ?? 0}
                        />
                    </div>
                    <hr />
                </div>
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
    booqId, title, path, position, ident,
}: {
    booqId: string,
    title?: string,
    path: BooqPath,
    position?: number,
    ident: number,
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
        .title {
            text-indent: ${ident}em;
        }
        `}</style>
    </>;
}
