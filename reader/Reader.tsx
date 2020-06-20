import React, { useState, useCallback, useMemo } from 'react';
import { positionForPath, samePath, BooqPath, BooqRange } from 'core';
import {
    BooqData, BooqAnchor, useSettings, useReportHistory,
    useHighlights, colorForGroup, quoteColor, pageForPosition,
} from 'app';
import { headerHeight, meter, bookFont, vars, boldWeight } from 'controls/theme';
import { BorderButton, IconButton } from 'controls/Buttons';
import { BooqLink, FeedLink } from 'controls/Links';
import { Spinner } from 'controls/Spinner';
import { usePopoverSingleton } from 'controls/Popover';
import { Themer } from 'components/Themer';
import { SignIn } from 'components/SignIn';
import { BooqContent, Augmentation, getAugmentationRect, getAugmentationText } from './BooqContent';
import { useContextMenu, ContextMenuState } from './ContextMenu';
import { useNavigationPanel } from './Navigation';
import { ReaderLayout } from './Layout';

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
    const range: BooqRange = useMemo(() => ({
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path ?? [booq.fragment.nodes.length],
    }), [booq]);
    const { augmentations, menuStateForAugmentation } = useAugmentations(booq.id, quote);
    const { visible, toggle } = useControlsVisibility();

    const pagesLabel = `${currentPage} of ${totalPages}`;
    const leftLabel = leftPages <= 1 ? 'Last page'
        : `${leftPages} pages left`;

    const { singleton, SingletonNode } = usePopoverSingleton();
    const {
        navigationOpen, NavigationButton, NavigationContent,
    } = useNavigationPanel(booq.id);
    const {
        ContextMenuNode, isVisible: contextMenuVisible,
        setMenuState,
    } = useContextMenu(booq.id);

    return <ReaderLayout
        isControlsVisible={!contextMenuVisible && visible}
        isNavigationOpen={navigationOpen}
        BooqContent={<div style={{
            fontFamily: bookFont,
            fontSize: `${fontScale}%`,
        }}>
            {SingletonNode}
            <BooqContent
                booqId={booq.id}
                nodes={booq.fragment.nodes}
                range={range}
                augmentations={augmentations}
                onScroll={onScroll}
                onClick={toggle}
                onAugmentationClick={id => {
                    const next = menuStateForAugmentation(id);
                    if (next) {
                        setMenuState(next);
                    }
                }}
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
        ContextMenu={ContextMenuNode}
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
        isControlsVisible={true}
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

function useAugmentations(booqId: string, quote?: BooqRange) {
    const { highlights } = useHighlights(booqId);
    const augmentations = useMemo(() => {
        const augmentations = highlights.map<Augmentation>(h => ({
            id: `highlight/${h.id}`,
            range: { start: h.start, end: h.end },
            color: colorForGroup(h.group),
        }));
        if (quote) {
            const quoteAugmentation: Augmentation = {
                range: quote,
                color: quoteColor,
                id: 'quote/0',
            };
            return [quoteAugmentation, ...augmentations];
        } else {
            return augmentations;
        }
    }, [quote, highlights]);
    return {
        augmentations,
        menuStateForAugmentation(augmentationId: string): ContextMenuState | undefined {
            const rect = getAugmentationRect(augmentationId);
            if (!rect) {
                return undefined;
            }
            const [kind, id] = augmentationId.split('/');
            switch (kind) {
                case 'quote':
                    return quote
                        ? {
                            rect,
                            target: {
                                kind: 'quote',
                                selection: {
                                    range: quote,
                                    text: getAugmentationText('quote/0'),
                                },
                            },
                        }
                        : undefined;
                case 'highlight': {
                    const highlight = highlights.find(hl => hl.id === id);
                    return highlight
                        ? {
                            rect,
                            target: {
                                kind: 'highlight',
                                highlight,
                            }
                        }
                        : undefined;
                }
                default:
                    return undefined;
            }
        },
    };
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
                font-weight: ${boldWeight};
                color: var(${vars.dimmed});
            }
            `}</style>
    </span>;
}
