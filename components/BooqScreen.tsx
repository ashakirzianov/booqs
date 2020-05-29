import React, { useState, useRef, useEffect, useCallback } from 'react';
import { positionForPath, samePath, BooqPath, BooqRange } from 'core';
import {
    BooqData, BooqAnchor, usePalette, useSettings, useReportHistory, pageForPosition,
} from 'app';
import { headerHeight, meter, bookFont } from 'controls/theme';
import { IconButton, BorderButton } from 'controls/Buttons';
import { Popovers } from 'controls/Popover';
import { BooqLink, FeedLink, quoteRef } from 'controls/Links';
import { BooqContent, BooqSelection, Colorization } from './BooqContent';
import { TocButton } from './Toc';
import { BookmarkButton } from './Bookmark';
import { Themer } from './Themer';
import { SignIn } from './SignIn';

const contentWidth = '50rem';
export function BooqScreen({
    booq, quote,
}: {
    booq: BooqData,
    quote?: BooqRange,
}) {
    const { fontScale } = useSettings();
    const { onScroll, currentPath } = useScrollHandler(booq);
    const { onSelection, selection } = useSelectionHandler();
    useOnCopy(useCallback(e => {
        if (selection.current && e.clipboardData) {
            e.preventDefault();
            const selectionText = quoteText(selection.current.text, booq.id, selection.current.range);
            e.clipboardData.setData('text/plain', selectionText);
        }
    }, [selection, booq.id]));

    const position = positionForPath(booq.fragment.nodes, currentPath);
    const nextChapter = booq.fragment.next
        ? positionForPath(booq.fragment.nodes, booq.fragment.next.path)
        : booq.length;
    const range: BooqRange = {
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path,
    };
    const colorization: Colorization[] = quote
        ? [{ range: quote, color: 'orange' }]
        : [];

    return <div className='container'>
        <Header booqId={booq.id} path={currentPath} />
        <EmptyLine />
        <div className='booq'>
            <AnchorButton
                booqId={booq.id}
                anchor={booq.fragment.previous}
                title='Previous'
            />
            <BooqContent
                booqId={booq.id}
                nodes={booq.fragment.nodes}
                range={range}
                onScroll={onScroll}
                onSelection={onSelection}
                colorization={colorization}
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
            nextChapter={nextChapter}
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

function quoteText(text: string, booqId: string, range: BooqRange) {
    const link = `${process.env.NEXT_PUBLIC_URL}${quoteRef(booqId, range)}`;
    return link;
}

function useScrollHandler({ id, fragment }: BooqData) {
    const [currentPath, setCurrentPath] = useState(fragment.current.path);
    const { reportHistory } = useReportHistory();
    return {
        currentPath,
        onScroll(path: BooqPath) {
            if (!samePath(path, currentPath)) {
                setCurrentPath(path);
                reportHistory({
                    booqId: id,
                    path,
                    source: 'not-implemented',
                });
            }
        },
    };
}

function useSelectionHandler() {
    const selection = useRef<BooqSelection>();
    return {
        selection,
        onSelection(newSelection?: BooqSelection) {
            selection.current = newSelection;
        },
    };
}

function useOnCopy(callback: (e: ClipboardEvent) => void) {
    useEffect(() => {
        window.document.addEventListener('copy', callback);
        return () => window.document.removeEventListener('copy', callback);
    }, [callback]);
}

function EmptyLine() {
    return <div style={{ height: headerHeight }} />;
}

function Header({ booqId, path }: {
    booqId: string,
    path: BooqPath,
}) {
    return <nav className='container'>
        <div className='left'>
            <div className='button'><FeedButton /></div>
            <div className='button'><TocButton booqId={booqId} /></div>
        </div>
        <div className='right'>
            <div className='button'>
                <BookmarkButton booqId={booqId} path={path} />
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
                flex: 1;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: space-between;
                height: ${headerHeight};
                position: fixed;
                top: 0; left: 0; right: 0;
                pointer-events: none;
                z-index: 10;
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

function Footer({ position, booqLength, nextChapter }: {
    position: number,
    booqLength: number,
    nextChapter: number,
}) {
    const { dimmed } = usePalette();
    const page = pageForPosition(position) + 1;
    const total = pageForPosition(booqLength);
    const chapter = pageForPosition(nextChapter);
    const leftPages = chapter - page;
    const leftLabel = leftPages === 0 ? 'Last page'
        : leftPages === 1 ? `${leftPages} page left`
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
                margin: ${meter.large};
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
