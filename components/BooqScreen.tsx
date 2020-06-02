import React, { useState, useRef, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { positionForPath, samePath, BooqPath, BooqRange } from 'core';
import {
    BooqData, BooqAnchor, usePalette, useSettings, useReportHistory, pageForPosition,
} from 'app';
import { headerHeight, meter, bookFont, menuFont } from 'controls/theme';
import { IconButton, BorderButton } from 'controls/Buttons';
import { Popovers } from 'controls/Popover';
import { BooqLink, FeedLink } from 'controls/Links';
import { BooqContent, BooqSelection, Colorization } from './BooqContent';
import { BooqContextMenu } from './BooqContextMenu';
import { TocButton } from './Toc';
import { BookmarkButton } from './Bookmark';
import { Themer } from './Themer';
import { SignIn } from './SignIn';
import { useHighlights, colorForGroup, quoteColor } from 'app/highlights';
import { Spinner } from 'controls/Spinner';

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

    const position = positionForPath(booq.fragment.nodes, currentPath);
    const nextChapter = booq.fragment.next
        ? positionForPath(booq.fragment.nodes, booq.fragment.next.path)
        : booq.length;
    const range: BooqRange = useMemo(() => ({
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path,
    }), [booq]);
    const colorization = useColorization(booq.id, quote);
    const { locked, lock, unlock } = useMenuLock();
    const { visible, toggle } = useControlsVisibility();

    return <div className='container'
        onMouseDown={lock}
        onTouchStart={lock}
        onMouseUp={unlock}
        onTouchEnd={unlock}
        onMouseLeave={unlock}
        onTouchCancel={unlock}
        onClick={toggle}
    >
        <Header
            booqId={booq.id} path={currentPath} visible={visible}
        />
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
            <BooqContextMenu
                locked={locked}
                booqId={booq.id}
                selection={selection}
            />
            <AnchorButton
                booqId={booq.id}
                anchor={booq.fragment.next}
                title='Next'
            />
        </div>
        <EmptyLine />
        <Footer
            visible={visible}
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

export function LoadingBooqScreen() {
    return <div className='container'>
        <LoadingHeader />
        <span className='label'>Loading...</span>
        <Spinner />
        <style jsx>{`
            .container {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100vw;
                height: 100vh;
                font-size: large;
                font-family: ${menuFont};
            }
            .label {
                margin: ${meter.large};
            }
            `}</style>
    </div>;
}

function useMenuLock() {
    const [locked, setLocked] = useState(false);
    const [visible, setVisible] = useState(false);
    return {
        locked,
        lock: () => setLocked(true),
        unlock: () => setLocked(false),
    };
}

function useControlsVisibility() {
    const [visible, setVisible] = useState(false);
    return {
        visible,
        toggle() {
            if (!isAnythingSelected()) {
                setVisible(!visible);
            }
        },
    };
}

function isAnythingSelected() {
    const selection = window.getSelection();
    if (!selection) {
        return false;
    }
    return selection.anchorNode !== selection.focusNode
        || selection.anchorOffset !== selection.focusOffset;
}

function useColorization(booqId: string, quote?: BooqRange) {
    const { highlights } = useHighlights(booqId);
    return useMemo(
        () => {
            const colorization = highlights.map<Colorization>(h => ({
                range: { start: h.start, end: h.end },
                color: colorForGroup(h.group),
            }));
            return quote
                ? [...colorization, { range: quote, color: quoteColor }]
                : colorization;
        },
        [quote, highlights],
    );
}

function useScrollHandler({ id, fragment }: BooqData) {
    const [currentPath, setCurrentPath] = useState(fragment.current.path);
    const { reportHistory } = useReportHistory();
    const onScroll = useCallback(function (path: BooqPath) {
        if (!samePath(path, currentPath)) {
            setCurrentPath(path);
            reportHistory({
                booqId: id,
                path,
                source: 'not-implemented',
            });
        }
    }, [id]);
    return {
        currentPath,
        onScroll,
    };
}

function useSelectionHandler() {
    const [selection, setSelection] = useState<BooqSelection | undefined>(undefined);
    const onSelection = useCallback(function (newSelection?: BooqSelection) {
        setSelection(newSelection);
    }, [setSelection]);
    return {
        selection,
        onSelection,
    };
}

function EmptyLine() {
    return <div style={{ height: headerHeight }} />;
}

const maxWidth = '1000px';
function Header({ booqId, path, visible }: {
    booqId?: string,
    path?: BooqPath,
    visible: boolean,
}) {
    const { background } = usePalette();
    if (!visible) {
        return null;
    }
    return <nav className='container'>
        <div className='left'>
            <div className='button'><FeedButton /></div>
            {
                booqId
                    ? <div className='button'><TocButton booqId={booqId} /></div>
                    : null
            }
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
            @media (max-width: ${maxWidth}) {
                .container {
                    background: ${background};
                    box-shadow: 2px 0px 2px rgba(0, 0, 0, 0.3);
                }
            }
            `}</style>
    </nav>;
}

function LoadingHeader() {
    return <Header visible={true} />;
}

function Footer({ position, booqLength, nextChapter, visible }: {
    visible: boolean,
    position: number,
    booqLength: number,
    nextChapter: number,
}) {
    const { dimmed, background } = usePalette();
    if (!visible) {
        return null;
    }
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
                position: fixed;
                bottom: 0; left: 0; right: 0;
                height: ${headerHeight};
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
            @media (max-width: ${maxWidth}) {
                .container {
                    background: ${background};
                    box-shadow: -2px 0px 2px rgba(0, 0, 0, 0.3);
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
