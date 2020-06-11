import React, { useState } from 'react';
import { BooqPath, comparePaths } from 'core';
import {
    pageForPosition, useToc, TocItem, Bookmark, useBookmarks,
} from 'app';
import { IconButton } from 'controls/Buttons';
import { BooqLink } from 'controls/Links';
import { meter, vars } from 'controls/theme';
import { IconName, Icon } from 'controls/Icon';

export function useNavigationPanel(booqId: string) {
    const [navigationOpen, setOpen] = useState(false);
    const NavigationButton = <IconButton
        icon='toc'
        onClick={() => setOpen(!navigationOpen)}
        isSelected={navigationOpen}
    />;
    const NavigationContent = <Navigation
        booqId={booqId}
        closeSelf={() => setOpen(false)}
    />;
    return {
        navigationOpen, NavigationButton, NavigationContent,
    };
}

function Navigation({ booqId, closeSelf }: {
    booqId: string,
    closeSelf: () => void,
}) {
    const { toc } = useToc(booqId);
    const { bookmarks } = useBookmarks(booqId);
    const items = buildDisplayItems({
        toc, bookmarks,
    });
    return <div className='container'>
        {
            items.map(
                (item, idx) => <div key={idx} onClick={closeSelf}>
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
                flex: 1 1;
                flex-flow: column nowrap;
            }
            .item:hover {
                color: var(${vars.highlight});
            }
            hr {
                width: 85%;
                border: none;
                border-top: 1px solid var(${vars.border});
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
