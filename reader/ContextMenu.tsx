import { useCallback, ReactNode, useState, useEffect } from 'react'
import {
    getBooqSelection, VirtualElement, getSelectionElement, BooqSelection,
} from '@/viewer'
import { ContextMenuContent, ContextMenuTarget } from './ContextMenuContent'
import { User } from '@/application/auth'
import { useFloater } from '@/components/Floater'

export type ContextMenuState = {
    target: ContextMenuTarget,
    anchor?: VirtualElement,
}

export function useContextMenu({
    booqId, self, updateCopilot, closed,
}: {
    booqId: string,
    self: User | undefined,
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
            self={self}
            target={menuState.target}
            setTarget={target => setMenuState({
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
        function setAnchor(anchor?: VirtualElement) {
            if (anchor) {
                setReference(anchor)
            }
        }
        if (typeof setterOrValue === 'function') {
            setMenuState(prev => {
                const next = setterOrValue(prev)
                setAnchor(next.anchor)
                return next
            })
        } else {
            setAnchor(setterOrValue.anchor)
            setMenuState(setterOrValue)
        }
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ContextMenuPanel({ content, anchor }: {
    content: ReactNode,
    anchor?: VirtualElement,
}) {
    // const visibility = anchor ? '' : 'hidden'
    const visibilityClass = anchor ? '' : 'translate-y-full opacity-0'
    return <div id='ctxmenu' className='flex flex-1 flex-col h-full justify-end items-stretch self-stretch pointer-events-none select-none' style={{
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }}>
        <div className={`${visibilityClass} rounded-sm m-base pointer-events-auto bg-background border border-border transition-all`}>{content}</div>
    </div>
}
