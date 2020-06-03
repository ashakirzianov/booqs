import React from 'react';
import { BooqPath } from 'core';
import { usePalette, pageForPosition } from 'app';
import { headerHeight, meter } from 'controls/theme';
import { IconButton } from 'controls/Buttons';
import { Popovers } from 'controls/Popover';
import { FeedLink } from 'controls/Links';
import { TocButton } from './Toc';
import { BookmarkButton } from './Bookmark';
import { Themer } from './Themer';
import { SignIn } from './SignIn';

export function EmptyLine() {
    return <div style={{ height: headerHeight }} />;
}

const transparentMaxWidth = '1000px';
export function Header({ booqId, path, visible }: {
    booqId?: string,
    path?: BooqPath,
    visible: boolean,
}) {
    const { background } = usePalette();
    return <nav className='container'>
        <div className='feed'><FeedButton /></div>
        <div className='toc'>
            {
                booqId
                    ? <TocButton booqId={booqId} />
                    : null
            }
        </div>
        <div className='bookmark'>
            {
                booqId && path
                    ? <BookmarkButton booqId={booqId} path={path} />
                    : null
            }
        </div>
        <Popovers>
            {
                singleton => <>
                    <div className='themer'><Themer singleton={singleton} /></div>
                    <div className='sign'><SignIn singleton={singleton} /></div>
                </>
            }
        </Popovers>
        <style jsx>{`
            .container {
                display: grid;
                grid-template-columns: auto auto 1fr auto auto auto;
                justify-items: center;
                align-items: center;
                height: ${headerHeight};
                position: fixed;
                top: 0; left: 0; right: 0;
                pointer-events: none;
                z-index: 10;
                transition: 250ms top;
            }
            .feed {
                grid-column: 1 / span 1;
            }
            .toc {
                grid-column: 2 / span 1;
            }
            .bookmark {
                grid-column: 4 / span 1;
            }
            .themer {
                grid-column: 5 / span 1;
            }
            .sign {
                grid-column: 6 / span 1;
            }
            .feed, .toc, .bookmark, .themer, .sign {
                margin: 0 ${meter.large};
                pointer-events: auto;
            }
            @media (max-width: ${transparentMaxWidth}) {
                .container {
                    grid-template-columns: auto auto 0 auto auto auto;
                    top: ${visible ? 0 : '-' + headerHeight};
                    background: ${background};
                    box-shadow: 2px 0px 2px rgba(0, 0, 0, 0.3);
                }
                .feed, .toc, .bookmark, .themer, .sign {
                    margin: 0;
                }
            }
            `}</style>
    </nav>;
}

export function LoadingHeader() {
    return <Header visible={true} />;
}

export function Footer({ position, booqLength, nextChapter, visible }: {
    visible: boolean,
    position: number,
    booqLength: number,
    nextChapter: number,
}) {
    const { dimmed, background } = usePalette();
    const page = pageForPosition(position) + 1;
    const total = pageForPosition(booqLength);
    const chapter = pageForPosition(nextChapter);
    const leftPages = chapter - page;
    const leftLabel = leftPages <= 0 ? 'Last page'
        : leftPages === 1 ? '1 page left'
            : `${leftPages} pages left`
    return <nav className='container'>
        <div className='left'>
            <span className='page'>{`${page} of ${total}`}</span>
        </div>
        <div className='right'>
            <span className='chapter-left'>{leftLabel}</span>
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: space-between;
                height: ${headerHeight};
                position: fixed;
                bottom: 0; left: 0; right: 0;
                pointer-events: none;
                transition: 250ms bottom;
            }
            .left, .right {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
            }
            .left {
                justify-content: flex-start;
            }
            .right {
                justify-content: flex-end;
            }
            .page, .chapter-left {
                font-size: small;
                margin: ${meter.large};
                color: ${dimmed};
            }
            @media (max-width: ${transparentMaxWidth}) {
                .container {
                    background: ${background};
                    box-shadow: -2px 0px 2px rgba(0, 0, 0, 0.3);
                    bottom: ${visible ? 0 : '-' + headerHeight};
                }
            }
            `}</style>
    </nav>;
}

function FeedButton() {
    return <FeedLink>
        <IconButton icon='back' />
    </FeedLink>;
}
