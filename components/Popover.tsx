'use client'
import React, { ReactNode, useState, useRef } from 'react'
import {
    useFloating, autoUpdate, offset, flip, shift,
    useDismiss, useRole, useClick, useInteractions,
    FloatingFocusManager, useId, useHover,
    safePolygon, FloatingArrow, arrow,
    useTransitionStyles,
} from '@floating-ui/react'

export function Popover({
    anchor, content, hasAction, placement,
}: {
    anchor: ReactNode,
    content: ReactNode,
    hasAction?: boolean,
    placement?: 'bottom' | 'right-start',
}) {
    const [isOpen, setIsOpen] = useState(false)
    const arrowRef = useRef(null)

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [
            offset(10),
            flip({
                fallbackAxisSideDirection: 'none'
            }),
            shift(),
            arrow({
                element: arrowRef,
            }),
        ],
        whileElementsMounted: autoUpdate,
        placement,
    })

    const click = useClick(context, {
        enabled: !hasAction,
    })
    const dismiss = useDismiss(context, {
        referencePress: hasAction,
    })
    const role = useRole(context)
    const hover = useHover(context, {
        handleClose: safePolygon(),
    })

    const { getReferenceProps, getFloatingProps } = useInteractions([
        click,
        dismiss,
        role,
        hover,
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

    const headingId = useId()

    return (
        <>
            <div ref={refs.setReference} {...getReferenceProps()}>
                {anchor}
            </div>
            {isOpen && (
                <FloatingFocusManager
                    context={context}
                    order={['reference', 'content']}
                >
                    <div
                        ref={refs.setFloating}
                        style={{
                            ...floatingStyles,
                            filter: 'drop-shadow(0 0 2px var(--color-border))',
                        }}
                        aria-labelledby={headingId}
                        {...getFloatingProps()}
                    >
                        <div
                            className='bg-background rounded-sm min-w-[10rem] min-h-[5rem] flex items-center justify-center'
                            style={transitionStyles}
                        >
                            <FloatingArrow
                                ref={arrowRef}
                                context={context}
                                fill='var(--color-background)'
                                stroke='var(--color-border)'
                                tipRadius={4}
                            />
                            {content}
                        </div>
                    </div>
                </FloatingFocusManager>
            )}
        </>
    )
}