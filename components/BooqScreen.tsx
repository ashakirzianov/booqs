import React, { useState } from 'react';
import { BooqData, BooqAnchor, usePalette, useSettings, pathToId, BooqPath, useReportHistory, positionForPath, pageForPosition, nodesLength } from '../app';
import { headerHeight, meter, radius, bookFont } from 'controls/theme';
import { IconButton, BorderButton } from 'controls/Buttons';
import { Popovers } from 'controls/Popover';
import { BooqContent } from './BooqContent';
import { TocButton } from './Toc';
import { BookmarkButton } from './Bookmark';
import { Themer } from './Themer';
import { SignIn } from './SignIn';
import { BooqLink, FeedLink } from 'controls/Links';

const contentWidth = '50rem';
export function BooqScreen({ booq }: {
    booq: BooqData,
}) {
    const { fontScale } = useSettings();
    const { onScroll, currentPath } = useScrollHandler(booq);
    const position = positionForPath(booq.fragment.nodes, currentPath);
    const chapterLength = booq.fragment.position + nodesLength(booq.fragment.nodes);
    return <div className='container'>
        <Header booqId={booq.id} />
        <EmptyLine />
        <div className='booq'>
            <AnchorButton
                booqId={booq.id}
                anchor={booq.fragment.previous}
                title='Previous'
            />
            <BooqContent
                booq={booq}
                onScroll={onScroll}
            />
            <AnchorButton
                booqId={booq.id}
                anchor={booq.fragment.next}
                title='Next'
            />
        </div>
        <EmptyLine />
        <Footer
            position={position}
            chapterLength={chapterLength}
            booqLength={booq.length}
        />
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: column;
                align-items: center;
            }
            .booq {
                display: flex;
                flex-flow: column;
                align-items: center;
                width: 100%;
                max-width: ${contentWidth};
                font-family: ${bookFont};
                font-size: ${fontScale}%;
            }
            `}</style>
    </div>;
}

function useScrollHandler({ id, fragment }: BooqData) {
    const [currentPath, setCurrentPath] = useState(fragment.current.path);
    const { reportHistory } = useReportHistory();
    return {
        currentPath,
        onScroll(path: BooqPath) {
            setCurrentPath(path);
            reportHistory({
                booqId: id,
                path,
                source: 'not-implemented',
            });
        },
    };
}

function EmptyLine() {
    return <div style={{ height: headerHeight }} />;
}

function Header({ booqId }: {
    booqId: string,
}) {
    return <nav className='container'>
        <div className='left'>
            <div className='button'><FeedButton /></div>
            <div className='button'><TocButton booqId={booqId} /></div>
        </div>
        <div className='right'>
            <div className='button'><BookmarkButton /></div>
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
                flex: 1;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: space-between;
                height: ${headerHeight};
                position: fixed;
                top: 0; left: 0; right: 0;
                pointer-events: none;
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
            .button {
                margin: 0 ${meter.regular};
                pointer-events: auto;
            }
            `}</style>
    </nav>;
}

function Footer({ position, booqLength, chapterLength }: {
    position: number,
    booqLength: number,
    chapterLength: number,
}) {
    const { dimmed } = usePalette();
    const page = pageForPosition(position);
    const total = pageForPosition(booqLength);
    const chapter = pageForPosition(chapterLength);
    return <nav className='container'>
        <div className='left'>
            <span className='page'>{`${page} of ${total}`}</span>
        </div>
        <div className='right'>
            <span className='chapter-left'>{`${chapter - page} pages left`}</span>
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
                margin: 0 ${meter.large};
                color: ${dimmed};
            }
            `}</style>
    </nav>;
}

function FeedButton() {
    return <FeedLink>
        <IconButton icon='back' />
    </FeedLink>;
}

function AnchorButton({ booqId, anchor, title }: {
    booqId: string,
    anchor?: BooqAnchor,
    title: string,
}) {
    if (!anchor) {
        return null;
    }
    return <BooqLink booqId={booqId} path={anchor.path}>
        <div className='container'>
            <BorderButton text={anchor.title ?? title} />
            <style jsx>{`
            .container {
                display: flex;
                flex-flow: row;
                align-items: center; 
                height: ${headerHeight};
            }`}</style>
        </div>
    </BooqLink>;
}
