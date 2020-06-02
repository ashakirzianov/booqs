import React, { useState, useCallback, useMemo } from 'react';
import { positionForPath, samePath, BooqPath, BooqRange } from 'core';
import {
    BooqData, BooqAnchor, useSettings, useReportHistory,
    useHighlights, colorForGroup, quoteColor,
} from 'app';
import { headerHeight, meter, bookFont, menuFont } from 'controls/theme';
import { BorderButton } from 'controls/Buttons';
import { BooqLink } from 'controls/Links';
import { Spinner } from 'controls/Spinner';
import { BooqContent, BooqSelection, Colorization } from './BooqContent';
import { BooqContextMenu } from './BooqContextMenu';
import { LoadingHeader, Footer, EmptyLine, Header, contentWidth } from './BooqControls';

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
