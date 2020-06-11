import React, { useState, useCallback, useMemo } from 'react';
import { positionForPath, samePath, BooqPath, BooqRange } from 'core';
import {
    BooqData, BooqAnchor, useSettings, useReportHistory,
    useHighlights, colorForGroup, quoteColor, pageForPosition,
} from 'app';
import { headerHeight, meter, bookFont, vars } from 'controls/theme';
import { BorderButton, IconButton } from 'controls/Buttons';
import { BooqLink, FeedLink } from 'controls/Links';
import { Spinner } from 'controls/Spinner';
import { useNavigationPanel } from 'components/Toc';
import { Themer } from 'components/Themer';
import { SignIn } from 'components/SignIn';
import { BooqContent, BooqSelection, Colorization } from './BooqContent';
import { ContextMenu } from './ContextMenu';
import { ReaderLayout } from './Layout';
import { usePopoverSingleton } from 'controls/Popover';

export function Reader({
    booq, quote,
}: {
    booq: BooqData,
    quote?: BooqRange,
}) {
    const { fontScale } = useSettings();
    const {
        onScroll, currentPath, currentPage, totalPages, leftPages,
    } = useScrollHandler(booq);
    const { onSelection, selection } = useSelectionHandler();
    const range: BooqRange = useMemo(() => ({
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path,
    }), [booq]);
    const colorization = useColorization(booq.id, quote);
    const { visible, toggle } = useControlsVisibility();

    const pagesLabel = `${currentPage} of ${totalPages}`;
    const leftLabel = leftPages <= 1 ? 'Last page'
        : `${leftPages} pages left`;

    const { singleton, singletonNode } = usePopoverSingleton();
    const {
        navigationOpen, NavigationButton, NavigationContent,
    } = useNavigationPanel(booq.id);

    return <ReaderLayout
        isVisible={visible}
        isNavigationOpen={navigationOpen}
        BooqContent={<div style={{
            fontFamily: bookFont,
            fontSize: `${fontScale}%`,
        }}>
            {singletonNode}
            <BooqContent
                booqId={booq.id}
                nodes={booq.fragment.nodes}
                range={range}
                colorization={colorization}
                onScroll={onScroll}
                onSelection={onSelection}
                onClick={toggle}
            />
        </div>}
        PrevButton={<AnchorButton
            booqId={booq.id}
            anchor={booq.fragment.previous}
            title='Previous'
        />}
        NextButton={<AnchorButton
            booqId={booq.id}
            anchor={booq.fragment.next}
            title='Next'
        />}
        ContextMenu={<ContextMenu
            booqId={booq.id}
            selection={selection}
        />}
        MainButton={<FeedLink>
            <IconButton icon='back' />
        </FeedLink>}
        NavigationButton={NavigationButton}
        ThemerButton={<Themer singleton={singleton} />}
        AccountButton={<SignIn singleton={singleton} />}
        CurrentPage={<PageLabel text={pagesLabel} />}
        PagesLeft={<PageLabel text={leftLabel} />}
        NavigationContent={NavigationContent}
    />;
}

export function LoadingBooqScreen() {
    return <ReaderLayout
        isVisible={true}
        isNavigationOpen={false}
        BooqContent={<div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            fontSize: 'xx-large',
        }}>
            <Spinner />
        </div>}
        PrevButton={null}
        NextButton={null}
        ContextMenu={null}
        MainButton={<FeedLink>
            <IconButton icon='back' />
        </FeedLink>}
        NavigationButton={null}
        ThemerButton={<Themer />}
        AccountButton={<SignIn />}
        CurrentPage={null}
        PagesLeft={null}
        NavigationContent={null}
    />;
}

function useControlsVisibility() {
    const [visible, setVisible] = useState(true);
    return {
        visible,
        toggle: useCallback(() => {
            if (!isAnythingSelected()) {
                setVisible(!visible);
            }
        }, [visible, setVisible]),
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

function useScrollHandler({ id, fragment, length }: BooqData) {
    const [currentPath, setCurrentPath] = useState(fragment.current.path);
    const { reportHistory } = useReportHistory();

    const position = positionForPath(fragment.nodes, currentPath);
    const nextChapter = fragment.next
        ? positionForPath(fragment.nodes, fragment.next.path)
        : length;
    const currentPage = pageForPosition(position) + 1;
    const totalPages = pageForPosition(length);
    const chapter = pageForPosition(nextChapter);
    const leftPages = chapter - currentPage + 1;

    const onScroll = function (path: BooqPath) {
        if (!samePath(path, currentPath)) {
            setCurrentPath(path);
            reportHistory({
                booqId: id,
                path,
            });
        }
    };
    return {
        currentPath,
        currentPage, totalPages, leftPages,
        onScroll,
    };
}

function useSelectionHandler() {
    const [selection, setSelection] = useState<BooqSelection | undefined>(undefined);
    const onSelection = function (newSelection?: BooqSelection) {
        setSelection(newSelection);
    };
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
                margin: ${meter.regular};
            }`}</style>
        </div>
    </BooqLink>;
}

function PageLabel({ text }: {
    text: string,
}) {
    return <span className='label'>
        {text}
        <style jsx>{`
            .label {
                font-size: small;
                color: var(${vars.dimmed});
            }
            `}</style>
    </span>;
}
