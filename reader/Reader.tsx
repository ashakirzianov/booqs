'use client'
import React, { useState, useCallback, useMemo } from 'react'
import { positionForPath, samePath, BooqPath, BooqRange } from '@/core'
import { BorderButton, IconButton } from '@/components/Buttons'
import { BooqLink, FeedLink, booqHref } from '@/components/Links'
import { Spinner } from '@/components/Loading'
import { Themer } from '@/components/Themer'
import { SignIn } from '@/components/SignIn'
import {
    BooqContent, getAugmentationElement, getAugmentationText,
    Augmentation,
    useOnBooqClick, useOnBooqScroll,
} from '@/viewer'
import { useContextMenu, ContextMenuState } from './ContextMenu'
import { useNavigationPanel } from './Navigation'
import { ReaderLayout } from './ReaderLayout'
import { BooqAnchor, BooqData } from '@/application/booq'
import { useSettings } from '@/application/settings'
import { useFilteredHighlights } from '@/application/navigation'
import { colorForGroup, pageForPosition, quoteColor } from '@/application/common'
import { useReportHistory } from '@/application/history'
import { User, useAuth } from '@/application/auth'
import { useCopilot } from '@/components/Copilot'

export function Reader({
    booq, quote,
}: {
    booq: BooqData,
    quote?: BooqRange,
}) {
    const self = useAuth()
    const { fontScale } = useSettings()
    const {
        onScroll, currentPath, currentPage, totalPages, leftPages,
    } = useScrollHandler(booq)
    useOnBooqScroll(onScroll, {
        throttle: 500,
    })
    const range: BooqRange = useMemo(() => ({
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path ?? [booq.fragment.nodes.length],
    }), [booq])
    const { augmentations, menuStateForAugmentation } = useAugmentations(booq.id, quote, self)
    const { visible, toggle } = useControlsVisibility()
    useOnBooqClick(toggle)

    const pagesLabel = `${currentPage} of ${totalPages}`
    const leftLabel = leftPages <= 1 ? 'Last page'
        : `${leftPages} pages left`

    const {
        navigationOpen, NavigationButton, NavigationContent,
    } = useNavigationPanel(booq.id, self)
    let {
        state: copilotState,
        setState,
        CopilotNode,
    } = useCopilot(booq)
    let copilotVisible = copilotState.kind !== 'empty'
    const {
        ContextMenuNode, isOpen: contextMenuVisible,
        updateMenuState: setMenuState,
    } = useContextMenu({
        booqId: booq.id,
        self,
        closed: copilotState.kind !== 'empty',
        updateCopilot(selection, anchor) {
            setState({
                kind: 'selected',
                selection,
                anchor,
                // TODO: implement context generation
                context: selection.text,
            })
        },
    })
    const onAugmentationClick = useMemo(() => {
        return (id: string) => {
            const next = menuStateForAugmentation(id)
            if (next) {
                setMenuState(next)
            }
        }
    }, [menuStateForAugmentation, setMenuState])

    return <ReaderLayout
        isControlsVisible={!contextMenuVisible && !copilotVisible && visible}
        isNavigationOpen={navigationOpen}
        BooqContent={<div style={{
            fontFamily: 'var(--font-book)',
            fontSize: `${fontScale}%`,
        }}>
            <BooqContent
                booqId={booq.id}
                nodes={booq.fragment.nodes}
                range={range}
                augmentations={augmentations}
                onAugmentationClick={onAugmentationClick}
                hrefForPath={booqHref}
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
        Copilot={CopilotNode}
        MainButton={<FeedLink>
            <IconButton icon='back' />
        </FeedLink>}
        NavigationButton={NavigationButton}
        ThemerButton={<Themer />}
        AccountButton={<SignIn />}
        CurrentPage={<PageLabel text={pagesLabel} />}
        PagesLeft={<PageLabel text={leftLabel} />}
        NavigationContent={NavigationContent}
    />
}

export function LoadingBooqScreen() {
    return <ReaderLayout
        isControlsVisible={true}
        isNavigationOpen={false}
        BooqContent={<div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            width: '100vw',
            height: '100vh',
            fontSize: 'xx-large',
        }}>
            <Spinner />
        </div>}
        PrevButton={null}
        NextButton={null}
        ContextMenu={null}
        Copilot={null}
        MainButton={<FeedLink>
            <IconButton icon='back' />
        </FeedLink>}
        NavigationButton={null}
        ThemerButton={<Themer />}
        AccountButton={<SignIn />}
        CurrentPage={null}
        PagesLeft={null}
        NavigationContent={null}
    />
}

function useControlsVisibility() {
    const [visible, setVisible] = useState(false)
    return {
        visible,
        toggle: useCallback(() => {
            if (!isAnythingSelected()) {
                setVisible(!visible)
            }
        }, [visible, setVisible]),
    }
}

function isAnythingSelected() {
    const selection = window.getSelection()
    if (!selection) {
        return false
    }
    return selection.anchorNode !== selection.focusNode
        || selection.anchorOffset !== selection.focusOffset
}

function useAugmentations(booqId: string, quote?: BooqRange, self?: User) {
    const highlights = useFilteredHighlights(booqId, self)
    const augmentations = useMemo(() => {
        const augmentations = highlights.map<Augmentation>(h => ({
            id: `highlight/${h.id}`,
            range: { start: h.start, end: h.end },
            color: colorForGroup(h.group),
        }))
        if (quote) {
            const quoteAugmentation: Augmentation = {
                range: quote,
                color: quoteColor,
                id: 'quote/0',
            }
            return [quoteAugmentation, ...augmentations]
        } else {
            return augmentations
        }
    }, [quote, highlights])
    const menuStateForAugmentation = useCallback(function (augmentationId: string): ContextMenuState | undefined {
        const anchor = getAugmentationElement(augmentationId)
        if (!anchor) {
            return undefined
        }
        const [kind, id] = augmentationId.split('/')
        switch (kind) {
            case 'quote':
                return quote
                    ? {
                        anchor,
                        target: {
                            kind: 'quote',
                            selection: {
                                range: quote,
                                text: getAugmentationText('quote/0'),
                            },
                        },
                    }
                    : undefined
            case 'highlight': {
                const highlight = highlights.find(hl => hl.id === id)
                return highlight
                    ? {
                        anchor,
                        target: {
                            kind: 'highlight',
                            highlight,
                        }
                    }
                    : undefined
            }
            default:
                return undefined
        }
    }, [quote, highlights])
    return {
        augmentations,
        menuStateForAugmentation,
    }
}

function useScrollHandler({ id, fragment, length }: BooqData) {
    const [currentPath, setCurrentPath] = useState(fragment.current.path)
    const { reportHistory } = useReportHistory()

    const position = positionForPath(fragment.nodes, currentPath)
    const nextChapter = fragment.next
        ? positionForPath(fragment.nodes, fragment.next.path)
        : length
    const currentPage = pageForPosition(position) + 1
    const totalPages = pageForPosition(length)
    const chapter = pageForPosition(nextChapter)
    const leftPages = chapter - currentPage + 1

    const onScroll = function (path: BooqPath) {
        if (!samePath(path, currentPath)) {
            setCurrentPath(path)
            reportHistory({
                booqId: id,
                path,
            })
        }
    }
    return {
        currentPath,
        currentPage, totalPages, leftPages,
        onScroll,
    }
}

function AnchorButton({ booqId, anchor, title }: {
    booqId: string,
    anchor?: BooqAnchor,
    title: string,
}) {
    if (!anchor) {
        return null
    }
    return <BooqLink booqId={booqId} path={anchor.path}>
        <div className='flex items-center h-header'>
            <BorderButton text={anchor.title ?? title} />
        </div>
    </BooqLink>
}

function PageLabel({ text }: {
    text: string,
}) {
    return <span className='text-sm text-dimmed font-bold'>
        {text}
    </span>
}
