'use client'
import { useCallback, ReactNode, useState, useEffect } from 'react'
import {
    getBooqSelection, VirtualElement, getSelectionElement, BooqSelection,
} from '@/viewer'
import { ContextMenuContent, ContextMenuTarget } from './ContextMenuContent'
import { useFloater } from '@/components/Floater'
import clsx from 'clsx'
import { AccountDisplayData } from '@/core'

export type ContextMenuState = {
    target: ContextMenuTarget,
    anchor?: VirtualElement,
}

export function useContextMenu({
    booqId, user, updateCopilot, closed,
}: {
    booqId: string,
    user: AccountDisplayData | undefined,
    closed: boolean,
    updateCopilot: (selection: BooqSelection, anchor: VirtualElement) => void,
}) {
    const [menuState, setMenuState] = useState<ContextMenuState>({
        target: { kind: 'empty' },
    })
    const [locked, setLocked] = useState(false)
    const isOpen = menuState.target.kind !== 'empty' && !locked && !closed
    function setIsOpen(open: boolean) {
        if (!open) {
            setMenuState({ target: { kind: 'empty' } })
        }
    }

    const { FloaterNode, setReference, floating } = useFloater({
        isOpen,
        setIsOpen,
        Content: <div className='w-40'><ContextMenuContent
            booqId={booqId}
            user={user}
            target={menuState.target}
            setTarget={target => updateMenuState({
                ...menuState,
                target,
            })}
            updateCopilot={selection => {
                if (menuState.anchor) {
                    const anchor = menuState.anchor
                    updateMenuState({
                        target: { kind: 'empty' },
                    })
                    updateCopilot(selection, anchor)
                }
            }}
        />
        </div>,
    })

    type ContextMenuStateSetter = (prev: ContextMenuState) => ContextMenuState
    const updateMenuState = useCallback(function (setterOrValue: ContextMenuStateSetter | ContextMenuState) {
        setMenuState(prev => {
            const next =
                typeof setterOrValue === 'function' ? setterOrValue(prev) : setterOrValue
            if (sameState(prev, next)) {
                return prev
            }
            if (next.anchor) {
                setReference(next.anchor)
            }
            return next
        })
    }, [setMenuState, setReference])

    useEffect(() => {
        function handleSelectionChange() {
            updateMenuState(prev => {
                if (prev.target.kind === 'empty' || prev.target.kind === 'selection') {
                    return getSelectionState()
                } else {
                    return prev
                }
            })
        }
        function isWithinCtxMenu(event: Event) {
            return floating.current?.contains(event.target as Element | null)
        }
        function lock(event: MouseEvent | TouchEvent) {
            if (!isWithinCtxMenu(event)) {
                setLocked(true)
            }
        }
        function unlock() {
            setLocked(false)
            setTimeout(() => {
                handleSelectionChange()
            }, 150)
        }
        window.document.addEventListener('mousedown', lock)
        window.document.addEventListener('touchstart', lock)
        window.document.addEventListener('mouseup', unlock)
        window.document.addEventListener('touchend', unlock)
        window.document.addEventListener('mouseleave', unlock)
        window.document.addEventListener('touchcancel', unlock)
        window.document.addEventListener('selectionchange', handleSelectionChange)
        return () => {
            window.document.removeEventListener('mousedown', lock)
            window.document.removeEventListener('touchstart', lock)
            window.document.removeEventListener('mouseup', unlock)
            window.document.removeEventListener('touchend', unlock)
            window.document.removeEventListener('mouseleave', unlock)
            window.document.removeEventListener('touchcancel', unlock)
            window.document.removeEventListener('selectionchange', handleSelectionChange)
        }
    }, [updateMenuState, setLocked, floating])

    return {
        isOpen,
        ContextMenuNode: FloaterNode,
        updateMenuState,
    }
}

function getSelectionState(): ContextMenuState {
    const element = getSelectionElement()
    if (element) {
        const selection = getBooqSelection()
        if (selection) {
            return {
                anchor: element,
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

function sameState(a: ContextMenuState, b: ContextMenuState) {
    if (a.target.kind === 'empty' && b.target.kind === 'empty' && a.anchor === b.anchor) {
        return true
    }
    if (a.target.kind === 'selection' && b.target.kind === 'selection') {
        if (a.target.selection.text === b.target.selection.text) {
            return true
        }
    }
    return false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ContextMenuPanel({ content, anchor }: {
    content: ReactNode,
    anchor?: VirtualElement,
}) {
    return <div id='ctxmenu' className='flex flex-1 flex-col h-full justify-end items-stretch self-stretch pointer-events-none select-none' style={{
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }}>
        <div className={clsx('rounded-sm m-base pointer-events-auto bg-background border border-border transition-all', {
            'translate-y-full opacity-0': !anchor,
        })}>{content}</div>
    </div>
}
