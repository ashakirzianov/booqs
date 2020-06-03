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
        <div className='left'>
            <div className='button'><FeedButton /></div>
            <div className='button'>
                {
                    booqId
                        ? <TocButton booqId={booqId} />
                        : null
                }
            </div>
        </div>
        <div className='right'>
            <div className='button'>
                {
                    booqId && path
                        ? <BookmarkButton booqId={booqId} path={path} />
                        : null
                }
            </div>
            <Popovers>
                {
                    singleton => <>
                        <div className='button'><Themer singleton={singleton} /></div>
                        <div className='button'><SignIn singleton={singleton} /></div>
                    </>
                }
            </Popovers>
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: row;
                justify-content: space-between;
                align-items: center;
                height: ${headerHeight};
                position: fixed;
                top: 0; left: 0; right: 0;
                pointer-events: none;
                z-index: 10;
                transition: 250ms top;
            }
            .left {
                display: flex;
                flex-flow: row;
                justify-content: flex-start;
            }
            .right {
                display: flex;
                flex-flow: row;
                justify-content: flex-end;
            }
            .button {
                margin: 0 ${meter.regular};
                pointer-events: auto;
            }
            @media (max-width: ${transparentMaxWidth}) {
                .container {
                    top: ${visible ? 0 : '-' + headerHeight};
                    background: ${background};
                    box-shadow: 2px 0px 2px rgba(0, 0, 0, 0.3);
                }
                .button {
                    margin: 0 ${meter.small};
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
