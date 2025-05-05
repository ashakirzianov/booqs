'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AccountDisplayData, BooqAnchor, BooqNote, BooqPath, BooqRange, contextForRange, PartialBooqData, pathToId, positionForPath, samePath, textForRange } from '@/core'
import { BorderButton, PanelButton } from '@/components/Buttons'
import { booqHref, feedHref } from '@/application/href'
import {
    BooqContent, getAugmentationElement, getAugmentationText,
    Augmentation,
    useOnBooqClick,
    useOnBooqScroll,
} from '@/viewer'
import { useContextMenu, type ContextMenuState } from './ContextMenu'
import { ReaderLayout } from './ReaderLayout'
import { resolveHighlightColor, currentSource, pageForPosition, quoteColor } from '@/application/common'
import { NavigationPanel, useNavigationState } from './NavigationPanel'
import { reportBooqHistory } from '@/data/user'
import { ThemerButton } from '@/components/Themer'
import { useFontScale } from '@/application/theme'
import { filterHighlights } from './nodes'
import { useAuth } from '@/application/auth'
import { Copilot, CopilotState } from '@/components/Copilot'
import { useBooqHighlights } from '@/application/highlights'
import { AccountButton } from '@/components/AccountButton'
import { usePathname } from 'next/navigation'
import { BackIcon, Spinner, TocIcon } from '@/components/Icons'
import Link from 'next/link'


export function Reader({
    booq, quote,
}: {
    booq: PartialBooqData,
    quote?: BooqRange,
}) {
    const pathname = usePathname()
    const { auth } = useAuth()
    const self: AccountDisplayData | undefined = auth.user
    const fontScale = useFontScale()
    const { highlights } = useBooqHighlights({ booqId: booq.id })
    const resolvedHighlights = useMemo(() => {
        return highlights.map<BooqNote>(h => ({
            ...h,
            start: h.range.start,
            end: h.range.end,
            text: textForRange(booq.fragment.nodes, h.range) ?? '',
        }))
    }, [highlights, booq.fragment.nodes])

    const quoteRef = useRef(quote)
    useEffect(() => {
        if (quoteRef.current) {
            const id = pathToId(quoteRef.current.start)
            const element = document.getElementById(id)
            if (element) {
                element.scrollIntoView({
                    behavior: 'instant',
                })
            }
        }
    }, [quoteRef])

    const {
        onScroll, currentPage, totalPages, leftPages,
    } = useScrollHandler(booq)
    useOnBooqScroll(onScroll, {
        throttle: 500,
    })
    const range: BooqRange = useMemo(() => ({
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path ?? [booq.fragment.nodes.length],
    }), [booq])

    const {
        navigationOpen, navigationSelection,
        toggleNavigationOpen, closeNavigation,
        toggleNavigationSelection,
    } = useNavigationState()
    const NavigationContent = <NavigationPanel
        booqId={booq.id}
        title={booq.meta.title ?? 'Untitled'}
        toc={booq.toc.items}
        highlights={resolvedHighlights}
        selection={navigationSelection}
        self={self}
        toggleSelection={toggleNavigationSelection}
        closeSelf={closeNavigation}
    />
    const NavigationButton = <PanelButton
        onClick={toggleNavigationOpen}
        selected={navigationOpen}
    >
        <TocIcon />
    </PanelButton>

    const filteredHighlights = useMemo(
        () => filterHighlights({
            highlights: resolvedHighlights,
            selection: navigationSelection,
            self,
        }), [resolvedHighlights, navigationSelection, self]
    )

    const { augmentations, menuStateForAugmentation } = useAugmentations({
        highlights: filteredHighlights,
        quote: quote,
    })
    const { visible, toggle } = useControlsVisibility()
    useOnBooqClick(toggle)

    const pagesLabel = `${currentPage} of ${totalPages}`
    const leftLabel = leftPages <= 1 ? 'Last page'
        : `${leftPages} pages left`

    const [copilotState, setCopilotState] = useState<CopilotState>({
        kind: 'empty',
    })
    const copilotVisible = copilotState.kind !== 'empty'
    const {
        ContextMenuNode, isOpen: contextMenuVisible,
        updateMenuState: setMenuState,
    } = useContextMenu({
        booqId: booq.id,
        self,
        closed: copilotState.kind !== 'empty',
        updateCopilot(selection, anchor) {
            setCopilotState({
                kind: 'selected',
                selection,
                anchor,
                context: contextForRange(booq.fragment.nodes, selection.range, 1000) ?? 'failed',
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

    const isControlsVisible = !contextMenuVisible && !copilotVisible && visible

    return <ReaderLayout
        isControlsVisible={isControlsVisible}
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
                hrefForPath={(id, path) => booqHref({ id, path })}
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
        Copilot={<Copilot
            state={copilotState}
            setState={setCopilotState}
            data={{
                id: booq.id,
                meta: booq.meta,
            }}
        />}
        MainButton={<Link href={feedHref()}>
            <PanelButton>
                <BackIcon />
            </PanelButton>
        </Link>}
        NavigationButton={NavigationButton}
        ThemerButton={<ThemerButton />}
        AccountButton={<AccountButton
            user={auth.user}
            from={pathname}
            loading={auth.state === 'loading'}
        />}
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
        MainButton={<Link href={feedHref()}>
            <PanelButton>
                <BackIcon />
            </PanelButton>
        </Link>}
        NavigationButton={null}
        ThemerButton={<ThemerButton />}
        AccountButton={<AccountButton />}
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

function useAugmentations({
    quote, highlights,
}: {
    highlights: BooqNote[],
    quote?: BooqRange,
}) {
    const augmentations = useMemo(() => {
        const augmentations = highlights.map<Augmentation>(h => ({
            id: `highlight/${h.id}`,
            range: h.range,
            color: resolveHighlightColor(h.color),
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

function useScrollHandler({ id, fragment, toc }: PartialBooqData) {
    const length = toc.length
    const [currentPath, setCurrentPath] = useState(fragment.current.path)

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
            reportBooqHistory({
                booqId: id,
                path,
                source: currentSource(),
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
    return <Link href={booqHref({ id: booqId, path: anchor.path })} className='flex items-center h-header'>
        <div className='flex items-center h-header'>
            <BorderButton text={anchor.title ?? title} />
        </div>
    </Link>
}

function PageLabel({ text }: {
    text: string,
}) {
    return <span className='text-sm text-dimmed font-bold'>
        {text}
    </span>
}
