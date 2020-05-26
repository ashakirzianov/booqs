import React, { useState } from 'react';
import { IconButton } from 'controls/Buttons';
import { Modal } from 'controls/Modal';
import { useToc } from 'app/toc';
import { Spinner } from 'controls/Spinner';
import { BooqPath, usePalette } from 'app';
import { BooqLink } from 'controls/Links';

export function TocButton({ booqId }: {
    booqId: string,
}) {
    const [open, setOpen] = useState(false);
    return <>
        <IconButton icon='toc' onClick={() => setOpen(true)} />
        <Modal
            isOpen={open}
            close={() => setOpen(false)}
        >
            <TocContent booqId={booqId} />
        </Modal>
    </>;
}

const tocWidth = '20rem';
function TocContent({ booqId }: {
    booqId: string,
}) {
    const { loading, items } = useToc(booqId);
    const { background, highlight } = usePalette();
    return <div className='container'>
        {
            loading ? <Spinner /> :
                items.map(
                    (item, idx) => <div key={idx} className='item'>
                        <TocItem
                            booqId={booqId}
                            title={item.title}
                            path={item.path}
                            position={item.position}
                        />
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
            `}</style>
    </div>;
}

function TocItem({
    booqId, title, path,
}: {
    booqId: string,
    title?: string,
    path: BooqPath,
    position?: number,
}) {
    return <>
        <BooqLink booqId={booqId} path={path}>
            <div className='content'>
                {title ?? 'no-title'}
            </div>
        </BooqLink>
        <style jsx>{`
        .content {
            display: flex;
            flex-flow: row nowrap;
            flex: 1;
        }
        `}</style>
    </>;
}
