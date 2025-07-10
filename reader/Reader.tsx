'use client'
import '@/app/wdyr'

import React, { useCallback, useMemo } from 'react'
import { BooqAnchor, BooqId, BooqNote, BooqRange, PartialBooqData, textForRange } from '@/core'
import { BorderButton, PanelButton } from '@/components/Buttons'
import { booqHref, feedHref } from '@/application/href'
import {
    BooqContent, getAugmentationElement, getAugmentationText,
    Augmentation,
} from '@/viewer'
import { useContextMenu, type ContextMenuState } from './ContextMenu'
import { ReaderLayout } from './ReaderLayout'
import { resolveNoteColor, quoteColor } from '@/application/common'
import { NavigationPanel, useNavigationState } from './NavigationPanel'
import { ThemerButton } from '@/components/Themer'
import { useFontScale } from '@/application/theme'
import { filterNotes } from './nodes'
import { useAuth } from '@/application/auth'
import { useBooqNotes } from '@/application/notes'
import { AccountButton } from '@/components/AccountButton'
import { usePathname } from 'next/navigation'
import { BackIcon, TocIcon } from '@/components/Icons'
import Link from 'next/link'
import { useScrollToQuote } from './useScrollToQuote'
import { useScrollHandler } from './useScrollHandler'
import { useControlsVisibility } from './useControlsVisibility'

export function Reader({
    booq, quote,
}: {
    booq: PartialBooqData,
    quote?: BooqRange,
}) {
    const pathname = usePathname()
    const { user, isLoading: isAuthLoading } = useAuth()
    const fontScale = useFontScale()
    useScrollToQuote(quote)
    const {
        currentPage, totalPages, leftPages,
    } = useScrollHandler(booq)

    const { notes } = useBooqNotes({ booqId: booq.booqId, user })
    const resolvedNotes = useMemo(() => {
        return notes.map<BooqNote>(note => ({
            ...note,
            start: note.range.start,
            end: note.range.end,
            text: textForRange(booq.fragment.nodes, note.range) ?? '',
        }))
    }, [notes, booq.fragment.nodes])

    const {
        navigationOpen, navigationSelection,
        toggleNavigationOpen, closeNavigation,
        toggleNavigationSelection,
    } = useNavigationState()
    const NavigationContent = <NavigationPanel
        booqId={booq.booqId}
        title={booq.meta.title ?? 'Untitled'}
        toc={booq.toc.items}
        notes={resolvedNotes}
        selection={navigationSelection}
        user={user}
        toggleSelection={toggleNavigationSelection}
        closeSelf={closeNavigation}
    />
    const NavigationButton = <PanelButton
        onClick={toggleNavigationOpen}
        selected={navigationOpen}
    >
        <TocIcon />
    </PanelButton>

    const filteredNotes = useMemo(
        () => filterNotes({
            notes: resolvedNotes,
            selection: navigationSelection,
            user,
        }), [resolvedNotes, navigationSelection, user]
    )

    const { augmentations, menuStateForAugmentation } = useAugmentations({
        notes: filteredNotes,
        quote: quote,
    })
    const { visible } = useControlsVisibility()

    const pagesLabel = `${currentPage} of ${totalPages}`
    const leftLabel = leftPages <= 1 ? 'Last page'
        : `${leftPages} pages left`

    const {
        ContextMenuNode, isOpen: contextMenuVisible,
        updateMenuState: setMenuState,
    } = useContextMenu({
        booqId: booq.booqId,
        booqMeta: booq.meta,
        user,
        closed: false,
    })

    const onAugmentationClick = useMemo(() => {
        return (id: string) => {
            const next = menuStateForAugmentation(id)
            if (next) {
                setMenuState(next)
            }
        }
    }, [menuStateForAugmentation, setMenuState])
    const isControlsVisible = !contextMenuVisible && visible

    const range: BooqRange = useMemo(() => ({
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path ?? [booq.fragment.nodes.length],
    }), [booq])

    return <ReaderLayout
        isControlsVisible={isControlsVisible}
        isNavigationOpen={navigationOpen}
        BooqContent={<div style={{
            fontFamily: 'var(--font-book)',
            fontSize: `${fontScale}%`,
        }}>
            <BooqContent
                booqId={booq.booqId}
                nodes={booq.fragment.nodes}
                range={range}
                augmentations={augmentations}
                onAugmentationClick={onAugmentationClick}
                hrefForPath={(id, path) => booqHref({ booqId: id, path })}
            />
        </div>}
        PrevButton={<AnchorButton
            booqId={booq.booqId}
            anchor={booq.fragment.previous}
            title='Previous'
        />}
        NextButton={<AnchorButton
            booqId={booq.booqId}
            anchor={booq.fragment.next}
            title='Next'
        />}
        ContextMenu={ContextMenuNode}
        Copilot={null}
        MainButton={<Link href={feedHref()}>
            <PanelButton>
                <BackIcon />
            </PanelButton>
        </Link>}
        NavigationButton={NavigationButton}
        ThemerButton={<ThemerButton />}
        AccountButton={<AccountButton
            user={user}
            from={pathname}
            loading={isAuthLoading}
        />}
        CurrentPage={<PageLabel text={pagesLabel} />}
        PagesLeft={<PageLabel text={leftLabel} />}
        NavigationContent={NavigationContent}
    />
}

function useAugmentations({
    quote, notes,
}: {
    notes: BooqNote[],
    quote?: BooqRange,
}) {
    const augmentations = useMemo(() => {
        const augmentations = notes.map<Augmentation>(note => ({
            id: `note/${note.id}`,
            range: note.range,
            color: resolveNoteColor(note.color),
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
    }, [quote, notes])
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
            case 'note': {
                const note = notes.find(hl => hl.id === id)
                return note
                    ? {
                        anchor,
                        target: {
                            kind: 'note',
                            note,
                        }
                    }
                    : undefined
            }
            default:
                return undefined
        }
    }, [quote, notes])
    return {
        augmentations,
        menuStateForAugmentation,
    }
}


function AnchorButton({ booqId, anchor, title }: {
    booqId: BooqId,
    anchor?: BooqAnchor,
    title: string,
}) {
    if (!anchor) {
        return null
    }
    return <Link href={booqHref({ booqId, path: anchor.path })} className='flex items-center h-header'>
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
