import { useCallback, ReactNode, useState } from 'react'
import {
    getBooqSelection, VirtualElement, getSelectionElement,
} from '@/viewer'
import { ContextMenuContent, ContextMenuTarget } from './ContextMenuContent'
import { User } from '@/application/auth'
import { useFloater } from '@/components/Floater'

export type ContextMenuState = {
    target: ContextMenuTarget,
    anchor?: VirtualElement,
};

export function useContextMenu(booqId: string, self?: User) {
    const [menuState, setMenuState] = useState<ContextMenuState>({
        target: { kind: 'empty' },
    })
    const isOpen = menuState.target.kind !== 'empty'
    function setIsOpen(open: boolean) {
        if (!open) {
            setMenuState({ target: { kind: 'empty' } })
        }
    }

    let { FloaterNode, setReference } = useFloater({
        isOpen,
        setIsOpen,
        handleSelectionChange() {
            updateMenuState(prev => {
                if (prev.target.kind === 'empty' || prev.target.kind === 'selection') {
                    return getSelectionState()
                } else {
                    return prev
                }
            })
        },
        Content: <ContextMenuContent
            booqId={booqId}
            self={self}
            target={menuState.target}
            setTarget={target => setMenuState({
                ...menuState,
                target,
            })}
        />,
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
