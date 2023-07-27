import { useCallback, ReactNode, useState, useEffect } from 'react'
import {
    useFloating, useDismiss, useInteractions, useTransitionStyles,
    flip, shift, inline, autoUpdate
} from '@floating-ui/react'
import {
    getBooqSelection, VirtualElement, getSelectionElement,
} from '@/viewer'
import { ContextMenuContent, ContextMenuTarget } from './ContextMenuContent'
import { useAuth } from '@/application'

export type ContextMenuState = {
    target: ContextMenuTarget,
    anchor?: VirtualElement,
};

export function useContextMenu(booqId: string) {
    const self = useAuth()
    const [menuState, setMenuState] = useState<ContextMenuState>({
        target: { kind: 'empty' },
    })
    const [locked, setLocked] = useState(false)
    const isOpen = menuState.target.kind !== 'empty' && !locked
    function setIsOpen(open: boolean) {
        if (!open) {
            setMenuState({ target: { kind: 'empty' } })
        }
    }
    const {
        refs: { floating, setReference, setFloating },
        floatingStyles, context,
    } = useFloating({
        placement: 'bottom',
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [inline(), flip(), shift()],
        whileElementsMounted: autoUpdate
    })

    const dismiss = useDismiss(context)

    const { getFloatingProps } = useInteractions([
        dismiss,
    ])

    const { styles: transitionStyles } = useTransitionStyles(context, {
        duration: 300,
        initial({ side }) {
            const translate = side === 'top' ? 'translateY(-20%)'
                : side === 'bottom' ? 'translateY(20%)'
                    : side === 'left' ? 'translateX(-20%)'
                        : 'translateX(20%)'
            return {
                opacity: 0,
                transform: `${translate} scale(0.9)`,
            }
        },
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
                let next = setterOrValue(prev)
                setAnchor(next.anchor)
                return next
            })
        } else {
            setAnchor(setterOrValue.anchor)
            setMenuState(setterOrValue)
        }
    }, [setMenuState, setReference])

    useEffect(() => {
        function isWithinCtxMenu(event: Event) {
            return floating.current?.contains(event.target as Element | null)
        }
        function handleSelectionChange() {
            updateMenuState(prev => {
                if (prev.target.kind === 'empty' || prev.target.kind === 'selection') {
                    return getSelectionState()
                } else {
                    return prev
                }
            })
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

    const ContextMenuNode = isOpen ? (
        <div
            ref={setFloating}
            style={{
                ...floatingStyles,
            }}
            {...getFloatingProps()}
        >
            <div className='bg-background rounded drop-shadow-2xl border border-border pointer-events-auto w-40' style={transitionStyles}>
                <ContextMenuContent
                    booqId={booqId}
                    self={self}
                    target={menuState.target}
                    setTarget={target => setMenuState({
                        ...menuState,
                        target,
                    })}
                />
            </div>
        </div>
    ) : null

    return {
        isOpen,
        ContextMenuNode,
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


function ContextMenuPanel({ content, anchor }: {
    content: ReactNode,
    anchor?: VirtualElement,
}) {
    const visibility = anchor ? '' : 'hidden'
    const visibilityClass = anchor ? '' : 'translate-y-full opacity-0'
    return <div id='ctxmenu' className='flex flex-1 flex-col h-full justify-end items-stretch self-stretch pointer-events-none select-none' style={{
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }}>
        <div className={`${visibilityClass} rounded m-base pointer-events-auto bg-background border border-border transition-all`}>{content}</div>
    </div>
}
