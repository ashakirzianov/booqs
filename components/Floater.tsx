import { ReactNode } from 'react'
import {
    useFloating, useDismiss, useInteractions, useTransitionStyles,
    flip, shift, inline, autoUpdate
} from '@floating-ui/react'

export function useFloater({
    isOpen, setIsOpen, Content,
}: {
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    Content: ReactNode,
}) {
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

    const FloaterNode = isOpen ? (
        <div
            ref={setFloating}
            style={{
                ...floatingStyles,
            }}
            {...getFloatingProps()}
        >
            <div className='bg-background rounded-sm drop-shadow-2xl border border-border pointer-events-auto overflow-clip' style={transitionStyles}>
                {Content}
            </div>
        </div>
    ) : null

    return {
        isOpen,
        setReference,
        floating,
        FloaterNode,
    }
}
