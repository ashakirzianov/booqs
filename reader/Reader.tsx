'use client'
// import '@/app/wdyr'

import React, { useMemo } from 'react'
import { BooqAnchor, BooqId, BooqPath, BooqRange } from '@/core'
import { BorderButton, PanelButton } from '@/components/Buttons'
import { booqHref, feedHref } from '@/common/href'
import {
    BooqContent,
} from '@/viewer'
import { useContextMenuFloater } from './useContextMenuFloater'
import { ReaderLayout } from './ReaderLayout'
import { NavigationPanel } from './NavigationPanel'
import { CommentsPanel } from './CommentsPanel'
import { ThemerButton } from './Themer'
import { useFontScale } from '@/application/theme'
import { useAuth } from '@/application/auth'
import { useNotesData } from './useNotesData'
import { useFollowingData } from './useFollowingData'
import { AccountButton } from '@/components/AccountButton'
import { usePathname } from 'next/navigation'
import { BackIcon, TocIcon, CommentIcon, QuestionMarkIcon } from '@/components/Icons'
import Link from 'next/link'
import { useScrollToQuote } from './useScrollToQuote'
import { useScrollHandler } from './useScrollHandler'
import { useControlsVisibility } from './useControlsVisibility'
import { useAugmentations } from './useAugmentations'
import { useContextMenuState } from './useContextMenuState'
import { ContextMenuContent } from './ContextMenuContent'
import { usePageData } from './usePageData'
import { useNavigationState } from './useNavigationState'
import clsx from 'clsx'
import { PartialBooqData } from '@/data/booqs'

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

    const {
        filteredHighlights, allHighlightsAuthors, comments,
        notesAreLoading,
    } = useNotesData({
        booqId: booq.booqId,
        user,
        currentRange: range,
        highlightsAuthorIds,
    })

    const { followingUserIds, isLoading: isFollowingLoading } = useFollowingData({ user })

    const [commentsPanelOpen, setCommentsPanelOpen] = React.useState(false)
    const toggleCommentsPanelOpen = () => setCommentsPanelOpen(prev => !prev)

    const { anchor, menuTarget, setMenuTarget, contextMenuAugmentations, displayTarget } = useContextMenuState()
    const ContextMenuContentNode = useMemo(() => {
        return <ContextMenuContent
            booqId={booq.booqId}
            user={user}
            target={menuTarget}
            setTarget={setMenuTarget}
        />
    }, [booq.booqId, user, menuTarget, setMenuTarget])

    const FloaterMenuContent = useMemo(() => {
        if (displayTarget !== 'floater') {
            return null
        }
        return <div className='w-64'>{ContextMenuContentNode}</div>
    }, [displayTarget, ContextMenuContentNode])

    const {
        ContextMenuNode
    } = useContextMenuFloater({
        Content: FloaterMenuContent,
        anchor: anchor,
        setTarget: setMenuTarget,
    })

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
        onClick={toggleCommentsPanelOpen}
        selected={commentsPanelOpen}
    >
        <CommentIcon />
    </PanelButton>

    const RightPanelContent =
        <>
            <div className={clsx('p-4 w-full overflow-y-auto', {
                'hidden': displayTarget !== 'side-panel',
            })}>
                {ContextMenuContentNode}
            </div>
            <div className={clsx('w-full', {
                'hidden': displayTarget === 'side-panel',
            })}>
                <CommentsPanel
                    comments={comments}
                    currentUser={user}
                    followingUserIds={followingUserIds}
                    isFollowingLoading={isFollowingLoading}
                />
            </div>
        </>


    const { augmentations, menuTargetForAugmentation } = useAugmentations({
        highlights: filteredHighlights,
        comments: comments,
        quote: quote,
        temporaryAugmentations: contextMenuAugmentations,
    })

    const pagesLabel = `${currentPage} of ${totalPages}`
    const leftLabel = leftPages <= 1 ? 'Last page'
        : `${leftPages} pages left`


    const onAugmentationClick = useMemo(() => {
        return (id: string) => {
            const next = menuTargetForAugmentation(id)
            if (next) {
                setMenuTarget(next)
            }
        }
    }, [menuTargetForAugmentation, setMenuTarget])

    const { visible } = useControlsVisibility()
    const isControlsVisible = (FloaterMenuContent === null) && visible
    // Auto-open right panel when context menu should be displayed in side panel and not hidden
    const shouldShowRightPanel = commentsPanelOpen || (displayTarget === 'side-panel')
    const showLoadingIndicator = notesAreLoading || isAuthLoading

    const toggleAskVisibility = useMemo(() => {
        return () => {
            setMenuTarget(menuTarget => {
                if (menuTarget.kind === 'ask') {
                    return {
                        ...menuTarget,
                        hidden: menuTarget.hidden === true ? false : true,
                    }
                }
                return menuTarget
            })
        }
    }, [setMenuTarget])
    const showAskButton = menuTarget.kind === 'ask' && menuTarget.question !== undefined
    const AskButton = showAskButton ? (
        <PanelButton
            onClick={toggleAskVisibility}
            selected={menuTarget.hidden !== true}
        >
            <QuestionMarkIcon />
        </PanelButton>
    ) : null

    const LeftButtons = <>
        <Link href={feedHref()}>
            <PanelButton>
                <BackIcon />
            </PanelButton>
        </Link>
        {NavigationButton}
    </>

    const RightButtons = <>
        {AskButton}
        {CommentsButton}
        <ThemerButton />
        <AccountButton
            user={user}
            from={pathname}
            loading={showLoadingIndicator}
        />
    </>

    const hrefForPath = useMemo(() => {
        return (path: BooqPath) => booqHref({ booqId: booq.booqId, path })
    }, [booq.booqId])

    return <ReaderLayout
        isControlsVisible={isControlsVisible}
        isLeftPanelOpen={navigationOpen}
        isRightPanelOpen={shouldShowRightPanel}
        BooqContent={<div style={{
            fontFamily: 'var(--font-book)',
            fontSize: `${fontScale}%`,
        }}>
            <BooqContent
                nodes={booq.fragment.nodes}
                range={range}
                augmentations={augmentations}
                onAugmentationClick={onAugmentationClick}
                hrefForPath={hrefForPath}
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