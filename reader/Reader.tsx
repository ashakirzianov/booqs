'use client'
// import '@/app/wdyr'

import React, { useMemo } from 'react'
import { BooqAnchor, BooqId, BooqRange, PartialBooqData } from '@/core'
import { BorderButton, PanelButton } from '@/components/Buttons'
import { booqHref, feedHref } from '@/core/href'
import {
    BooqContent,
} from '@/viewer'
import { useContextMenuFloater } from './useContextMenuFloater'
import { ReaderLayout } from './ReaderLayout'
import { NavigationPanel, useNavigationState } from './NavigationPanel'
import { CommentsPanel } from './CommentsPanel'
import { ThemerButton } from '@/components/Themer'
import { useFontScale } from '@/application/theme'
import { useAuth } from '@/application/auth'
import { useNotesData } from './useNotesData'
import { useFollowingData } from './useFollowingData'
import { AccountButton } from '@/components/AccountButton'
import { usePathname } from 'next/navigation'
import { BackIcon, TocIcon, CommentIcon } from '@/components/Icons'
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

    const range: BooqRange = useMemo(() => ({
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path ?? [booq.fragment.nodes.length],
    }), [booq])

    const {
        navigationOpen, navigationSelection,
        toggleNavigationOpen, closeNavigation,
        toggleNavigationSelection,
    } = useNavigationState()

    const highlightsAuthorIds = useMemo(() => {
        const set = new Set<string>()
        if (navigationSelection.notes && user?.id) {
            set.add(user.id)
        }
        for (const [key, value] of Object.entries(navigationSelection)) {
            if (key.startsWith('author:') && value) {
                const authorId = key.split(':')[1]
                set.add(authorId)
            }
        }
        return set
    }, [navigationSelection, user?.id])

    const { filteredHighlights, allHighlightsAuthors, comments } = useNotesData({
        booqId: booq.booqId,
        user,
        currentRange: range,
        highlightsAuthorIds,
    })

    const { followingUserIds, isLoading: isFollowingLoading } = useFollowingData({ user })

    const [rightPanelOpen, setRightPanelOpen] = React.useState(false)
    const toggleRightPanelOpen = () => setRightPanelOpen(prev => !prev)
    const NavigationContent = <NavigationPanel
        booqId={booq.booqId}
        title={booq.meta.title ?? 'Untitled'}
        toc={booq.toc.items}
        notes={filteredHighlights}
        selection={navigationSelection}
        user={user}
        highlightAuthors={allHighlightsAuthors}
        toggleSelection={toggleNavigationSelection}
        closeSelf={closeNavigation}
    />
    const NavigationButton = <PanelButton
        onClick={toggleNavigationOpen}
        selected={navigationOpen}
    >
        <TocIcon />
    </PanelButton>

    const CommentsButton = <PanelButton
        onClick={toggleRightPanelOpen}
        selected={rightPanelOpen}
    >
        <CommentIcon />
    </PanelButton>

    const RightPanelContent = <CommentsPanel
        comments={comments}
        currentUser={user}
        followingUserIds={followingUserIds}
        isFollowingLoading={isFollowingLoading}
    />

    const { anchor, menuTarget, setMenuTarget, contextMenuAugmentations } = useContextMenuState()

    const { augmentations, menuTargetForAugmentation } = useAugmentations({
        highlights: filteredHighlights,
        comments: comments,
        quote: quote,
        temporaryAugmentations: contextMenuAugmentations,
    })
    const { visible } = useControlsVisibility()

    const pagesLabel = `${currentPage} of ${totalPages}`
    const leftLabel = leftPages <= 1 ? 'Last page'
        : `${leftPages} pages left`

    const MenuContent = useMemo(() => {
        if (menuTarget.kind === 'empty') {
            return null
        }
        return <div className='w-64'><ContextMenuContent
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

    const LeftButtons = <>
        <Link href={feedHref()}>
            <PanelButton>
                <BackIcon />
            </PanelButton>
        </Link>
        {NavigationButton}
    </>

    const RightButtons = <>
        {CommentsButton}
        <ThemerButton />
        <AccountButton
            user={user}
            from={pathname}
            loading={isAuthLoading}
        />
    </>

    return <ReaderLayout
        isControlsVisible={isControlsVisible}
        isLeftPanelOpen={navigationOpen}
        isRightPanelOpen={rightPanelOpen}
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
        LeftButtons={LeftButtons}
        RightButtons={RightButtons}
        LeftFooter={<PageLabel text={pagesLabel} />}
        RightFooter={<PageLabel text={leftLabel} />}
        LeftPanelContent={NavigationContent}
        RightPanelContent={RightPanelContent}
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
