'use client'
// import '@/app/wdyr'

import React, { useMemo } from 'react'
import { BooqAnchor, BooqId, BooqNote, BooqRange, PartialBooqData, textForRange } from '@/core'
import { BorderButton, PanelButton } from '@/components/Buttons'
import { booqHref, feedHref } from '@/application/href'
import {
    BooqContent,
} from '@/viewer'
import { useContextMenuFloater } from './useContextMenuFloater'
import { ReaderLayout } from './ReaderLayout'
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
import { useAugmentations } from './useAugmentations'
import { useContextMenuState } from './useContextMenuState'
import { ContextMenuContent } from './ContextMenuContent'
import { usePageData } from './usePageData'

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
        currentPath,
    } = useScrollHandler({
        booqId: booq.booqId,
        initialPath: booq.fragment.current.path,
    })
    const { currentPage, leftPages, totalPages } = usePageData({
        booq,
        currentPath,
    })

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

    const { augmentations, menuTargetForAugmentation } = useAugmentations({
        notes: filteredNotes,
        quote: quote,
    })
    const { visible } = useControlsVisibility()

    const pagesLabel = `${currentPage} of ${totalPages}`
    const leftLabel = leftPages <= 1 ? 'Last page'
        : `${leftPages} pages left`

    const { anchor, menuTarget, setMenuTarget } = useContextMenuState()

    const MenuContent = useMemo(() => {
        if (menuTarget.kind === 'empty') {
            return null
        }
        return <div><ContextMenuContent
            booqId={booq.booqId}
            booqMeta={booq.meta}
            user={user}
            target={menuTarget}
            setTarget={setMenuTarget}
        /></div>
    }, [booq.booqId, booq.meta, user, menuTarget, setMenuTarget])

    const {
        ContextMenuNode
    } = useContextMenuFloater({
        Content: MenuContent,
        anchor: anchor,
        setTarget: setMenuTarget,
    })

    const onAugmentationClick = useMemo(() => {
        return (id: string) => {
            const next = menuTargetForAugmentation(id)
            if (next) {
                setMenuTarget(next)
            }
        }
    }, [menuTargetForAugmentation, setMenuTarget])
    const isControlsVisible = (MenuContent === null) && visible

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
