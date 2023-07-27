'use client'
import React, { ReactNode, useState, useRef } from 'react'
import {
    useFloating, autoUpdate, offset, flip, shift,
    useDismiss, useRole, useClick, useInteractions,
    FloatingFocusManager, useId, useHover,
    safePolygon, FloatingArrow, arrow,
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
                            filter: 'drop-shadow(0 0 2px var(--theme-border))',
                        }}
                        aria-labelledby={headingId}
                        {...getFloatingProps()}
                    >
                        <div
                            className='bg-background rounded min-w-[10rem] min-h-[5rem] flex items-center justify-center'
                        >
                            <FloatingArrow
                                ref={arrowRef}
                                context={context}
                                fill='var(--theme-background)'
                                stroke='var(--theme-border)'
                                // strokeWidth={1}
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