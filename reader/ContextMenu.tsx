import React, { useCallback, ReactNode, useRef, useState } from 'react'
import { useDocumentEvent } from '@/controls/utils'
import { Overlay } from '@/controls/Popover'
import {
    getBooqSelection, AnchorRect, getSelectionRect, getAugmentationRect,
} from './BooqContent'
import { ContextMenuContent, ContextMenuTarget } from './ContextMenuContent'
import { throttle } from 'lodash'
import { useAuth } from '@/application'

export function useContextMenu(booqId: string) {
    const { menuState, setMenuState } = useMenuState()
    const self = useAuth()
    const ContextMenuNode = <ContextMenuLayout
        rect={menuState.rect}
        content={<ContextMenuContent
            booqId={booqId}
            self={self}
            target={menuState.target}
            setTarget={target => setMenuState({
                ...menuState,
                target,
            })}
        />}
    />

    return {
        isVisible: menuState.target.kind !== 'empty',
        ContextMenuNode,
        setMenuState,
    }
}

export type ContextMenuState = {
    target: ContextMenuTarget,
    rect?: AnchorRect,
};
function useMenuState() {
    const [menuState, setMenuState] = useState<ContextMenuState>({
        target: { kind: 'empty' },
    })
    const handleSelectionChange = useCallback(() => setMenuState(prev => {
        if (prev.target.kind === 'empty' || prev.target.kind === 'selection') {
            return getSelectionState()
        } else {
            return prev
        }
    }), [])
    const locked = useRef(false)
    const unhandled = useRef(false)
    const lock = useCallback(() => locked.current = true, [locked])
    const unlock = useCallback(() => {
        locked.current = false
        handleSelectionChange()
    }, [locked, unhandled, handleSelectionChange])
    useDocumentEvent('mousedown', lock)
    useDocumentEvent('touchstart', lock)
    useDocumentEvent('mouseup', unlock)
    useDocumentEvent('touchend', unlock)
    useDocumentEvent('mouseleave', unlock)
    useDocumentEvent('touchcancel', unlock)

    const selectionHandler = useCallback(() => {
        if (!locked.current) {
            handleSelectionChange()
        } else {
            unhandled.current = true
        }
    }, [])

    useDocumentEvent('selectionchange', selectionHandler)

    useDocumentEvent('scroll', useCallback(throttle(() => {
        setMenuState(prev => {
            if (prev.target.kind === 'selection') {
                const rect = getSelectionRect()
                if (rect) {
                    return {
                        ...prev,
                        rect,
                    }
                } else {
                    return { target: { kind: 'empty' } }
                }
            } else if (prev.target.kind === 'highlight') {
                const rect = getAugmentationRect(`highlight/${prev.target.highlight.id}`)
                if (rect) {
                    return {
                        ...prev,
                        rect,
                    }
                } else {
                    return { target: { kind: 'empty' } }
                }
            } else if (prev.target.kind === 'quote') {
                const rect = getAugmentationRect('quote/0')
                if (rect) {
                    return {
                        ...prev,
                        rect,
                    }
                } else {
                    return { target: { kind: 'empty' } }
                }
            } else {
                return prev
            }
        })
    }, 200), []))

    useDocumentEvent('click', event => {
        if (!isWithinCtxMenu(event.target)) {
            const selection = getBooqSelection()
            if (!selection) {
                setMenuState({
                    target: { kind: 'empty' },
                })
            }
        }
    })

    return {
        menuState,
        setMenuState,
    }
}

function isWithinCtxMenu(target: any): boolean {
    if (!target) {
        return false
    } else if (target.id === 'ctxmenu') {
        return true
    } else {
        return isWithinCtxMenu(target.parent)
    }
}

function getSelectionState(): ContextMenuState {
    const rect = getSelectionRect()
    if (rect) {
        const selection = getBooqSelection()
        if (selection) {
            return {
                rect,
                target: {
                    kind: 'selection',
                    selection,
                },
            }
        }
    }
    return {
        target: { kind: 'empty' },
    }
}

function ContextMenuLayout({ content, rect }: {
    content: ReactNode,
    rect?: AnchorRect,
}) {
    return rect
        ? <ContextMenuPopover
            content={content}
            rect={rect}
        />
        : null
}

function ContextMenuPopover({
    content, rect: { top, left, width, height },
}: {
    content: ReactNode,
    rect: AnchorRect,
}) {
    return <Overlay
        placement='bottom'
        visible={true}
        content={<div id='ctxmenu' style={{
            width: '12rem',
            pointerEvents: 'auto',
        }}>
            {content}
        </div>}
        anchor={<div style={{
            position: 'fixed',
            pointerEvents: 'none',
            top, left, width, height,
        }} />}
    />
}

function ContextMenuPanel({ content, rect }: {
    content: ReactNode,
    rect?: AnchorRect,
}) {
    const visibility = rect ? '' : 'hidden'
    const visibilityClass = rect ? '' : 'translate-y-full opacity-0'
    return <div id='ctxmenu' className='flex flex-1 flex-col h-full justify-end items-stretch self-stretch pointer-events-none select-none' style={{
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }}>
        <div className={`${visibilityClass} rounded m-base pointer-events-auto bg-background border border-border transition-all`}>{content}</div>
    </div>
}
