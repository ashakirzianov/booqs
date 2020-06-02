import React, { useState } from 'react';
import { BooqPath, comparePaths } from 'core';
import {
    usePalette, pageForPosition, useToc, TocItem, Bookmark, useBookmarks,
} from 'app';
import { IconButton } from 'controls/Buttons';
import { Modal } from 'controls/Modal';
import { Spinner } from 'controls/Spinner';
import { BooqLink } from 'controls/Links';
import { meter } from 'controls/theme';
import { IconName, Icon } from 'controls/Icon';

export function TocButton({ booqId }: {
    booqId: string,
}) {
    const [open, setOpen] = useState(false);
    const { loading, toc } = useToc(booqId);
    const { bookmarks } = useBookmarks(booqId);
    const display = buildDisplayItems({
        toc, bookmarks,
    });
    return <>
        <IconButton icon='toc' onClick={() => setOpen(true)} />
        <Modal
            isOpen={open}
            close={() => setOpen(false)}
            title='Contents'
        >
            {
                loading ? <Spinner /> :
                    <TocContent booqId={booqId} items={display} />
            }
        </Modal>
    </>;
}

const tocWidth = '50rem';
function TocContent({ booqId, items }: {
    booqId: string,
    items: DisplayItem[],
}) {
    const { background, highlight, border } = usePalette();
    return <div className='container'>
        {
            items.map(
                (item, idx) => <div key={idx}>
                    <div className='item'>
                        <TocRow
                            booqId={booqId}
                            item={item}
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
    booqId,
    item: { kind, title, path, page, level, icon },
}: {
    booqId: string,
    item: DisplayItem,
}) {
    return <>
        <BooqLink booqId={booqId} path={path}>
            <div className='content'>
                <span className='title'>{title ?? 'no-title'}</span>
                {
                    page
                        ? <span className='page'>{page}</span>
                        : null
                }
                {
                    icon
                        ? <Icon name={icon} />
                        : null
                }
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
            text-indent: ${level}em;
            font-style: ${kind === 'bookmark' ? 'italic' : 'normal'};
        }
        `}</style>
    </>;
}

type DisplayItem = {
    kind: 'chapter' | 'bookmark',
    title: string,
    page?: string,
    level: number,
    path: BooqPath,
    icon?: IconName,
};
function buildDisplayItems({
    toc, bookmarks,
}: {
    toc: TocItem[],
    bookmarks: Bookmark[],
}): DisplayItem[] {
    const maxLevel = toc.reduce((max, i) => Math.max(max, i.level ?? 0), 0);
    const fromToc = toc.map<DisplayItem>(item => ({
        kind: 'chapter',
        title: item.title ?? '<no title>',
        page: item.position ? `${pageForPosition(item.position)}` : undefined,
        level: maxLevel - (item.level ?? 0),
        path: item.path,
    }));
    const fromBookmarks = bookmarks.map<DisplayItem>(bm => ({
        kind: 'bookmark',
        title: 'your bookmark',
        level: 0,
        path: bm.path,
        icon: 'bookmark-empty',
    }));
    const items = [...fromToc, ...fromBookmarks]
        .sort((a, b) => comparePaths(a.path, b.path));
    let lastLevel = 0;
    for (const item of items) {
        if (item.kind !== 'chapter') {
            item.level = lastLevel + 1;
        } else {
            lastLevel = item.level;
        }
    }

    return items;
}
