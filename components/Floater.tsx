import { ReactNode, useState, useEffect } from 'react'
import {
    useFloating, useDismiss, useInteractions, useTransitionStyles,
    flip, shift, inline, autoUpdate
} from '@floating-ui/react'

export function useFloater({
    isOpen, setIsOpen, handleSelectionChange, Content,
}: {
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    handleSelectionChange: () => void,
    Content: ReactNode,
}) {
    const [locked, setLocked] = useState(false)
    isOpen = isOpen && !locked
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

    useEffect(() => {
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
    }, [handleSelectionChange, setLocked, floating])

    const FloaterNode = isOpen ? (
        <div
            ref={setFloating}
            style={{
                ...floatingStyles,
            }}
            {...getFloatingProps()}
        >
            <div className='bg-background rounded drop-shadow-2xl border border-border pointer-events-auto w-40' style={transitionStyles}>
                {Content}
            </div>
        </div>
    ) : null

    return {
        isOpen,
        setReference,
        FloaterNode,
    }
}
