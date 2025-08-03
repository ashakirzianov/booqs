'use client'
// import '@/app/wdyr'

import React, { useEffect, useMemo } from 'react'
import { Booq, BooqAnchor, BooqId, BooqPath, BooqRange, buildFragment, pathFromString } from '@/core'
import { PanelButton } from '@/components/Buttons'
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
import { useNotesData } from './useNotesData'
import { useFollowingData } from './useFollowingData'
import { AccountButton } from '@/components/AccountButton'
import { usePathname, useSearchParams } from 'next/navigation'
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
import { BooqNote } from '@/data/notes'
import { AccountData } from '@/data/user'

export function Reader({
    booqId, booq, notes: initialNotes, user,
}: {
    booqId: BooqId,
    booq: Booq,
    notes: BooqNote[],
    user: AccountData | undefined,
}) {
    const { quote, path } = useBooqSearchParams()
    const fragment = useMemo(() => {
        return buildFragment({
            booq,
            path: path ?? undefined,
        })
    }, [booq, path])
    const pathname = usePathname()
    const fontScale = useFontScale()
    useScrollToQuote(quote)
    const {
        currentPath,
    } = useScrollHandler({
        booqId: booqId,
        initialPath: fragment.current.path,
    })
    const { currentPage, leftPages, totalPages } = usePageData({
        fragment,
        meta: booq.metadata,
        currentPath,
    })

    const range: BooqRange = useMemo(() => ({
        start: fragment.current.path,
        end: fragment.next?.path ?? [fragment.nodes.length],
    }), [fragment])

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
    } = useNotesData({
        booqId,
        user,
        currentRange: range,
        highlightsAuthorIds,
        initialNotes,
    })

    const { followingUserIds, isLoading: isFollowingLoading } = useFollowingData({ user })

    const [commentsPanelOpen, setCommentsPanelOpen] = React.useState(false)
    const toggleCommentsPanelOpen = () => setCommentsPanelOpen(prev => !prev)

    const { anchor, menuTarget, setMenuTarget, contextMenuAugmentations, displayTarget } = useContextMenuState()
    const ContextMenuContentNode = useMemo(() => {
        return <ContextMenuContent
            booqId={booqId}
            user={user}
            target={menuTarget}
            setTarget={setMenuTarget}
        />
    }, [booqId, user, menuTarget, setMenuTarget])

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
        booqId={booqId}
        title={booq.metadata.title ?? 'Untitled'}
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

    const showLoadingIndicator = useIsLoading()
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
        return (path: BooqPath) => booqHref({ booqId: booqId, path })
    }, [booqId])

    return <ReaderLayout
        isControlsVisible={isControlsVisible}
        isLeftPanelOpen={navigationOpen}
        isRightPanelOpen={shouldShowRightPanel}
        BooqContent={<div style={{
            fontFamily: 'var(--font-book)',
            fontSize: `${fontScale}%`,
        }}>
            <BooqContent
                nodes={fragment.nodes}
                range={range}
                augmentations={augmentations}
                onAugmentationClick={onAugmentationClick}
                hrefForPath={hrefForPath}
            />
        </div>}
        PrevButton={<AnchorButton
            booqId={booqId}
            anchor={fragment.previous}
            title='Previous'
        />}
        NextButton={<AnchorButton
            booqId={booqId}
            anchor={fragment.next}
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

function useIsLoading() {
    const [loading, setLoading] = React.useState(true)
    useEffect(() => {
        setLoading(false)
    }, [])
    return loading
}

function useBooqSearchParams() {
    const searchParams = useSearchParams()
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')
    const pathParam = searchParams.get('path')
    return useMemo(() => {
        const startPath = startParam !== null
            ? pathFromString(startParam)
            : undefined
        const endPath = endParam !== null
            ? pathFromString(endParam)
            : undefined
        const booqPath = pathParam !== null
            ? pathFromString(pathParam)
            : undefined
        const quote = startPath && endPath
            ? { start: startPath, end: endPath }
            : undefined
        const path = booqPath ?? [0]
        return { quote, path }
    }, [startParam, endParam, pathParam])
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
        <div className='flex items-center h-header border border-dimmed text-dimmed'>
            {anchor.title ?? title}
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