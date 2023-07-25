'use client'
import React, { ReactNode, ReactElement, useState, useRef } from 'react'
import {
    useFloating, autoUpdate, offset, flip, shift,
    useDismiss, useRole, useClick, useInteractions,
    FloatingFocusManager, useId, useHover,
    safePolygon, FloatingArrow, arrow,
} from '@floating-ui/react'

// TODO: implement
export function Overlay({
    anchor, content, placement, visible, hideOnClick,
}: {
    anchor: ReactElement,
    content: ReactNode,
    placement: 'bottom' | 'right-start',
    visible?: boolean,
    hideOnClick?: boolean,
}) {
    return anchor
}

export function Popover({
    anchor, content, hasAction,
}: {
    anchor: ReactNode,
    content: ReactNode,
    hasAction?: boolean,
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
            // hide(),
        ],
        whileElementsMounted: autoUpdate,
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
                        style={floatingStyles}
                        aria-labelledby={headingId}
                        {...getFloatingProps()}
                        className='px-4'
                    >
                        <div
                            className='bg-background rounded drop-shadow min-w-[10rem] min-h-[5rem] flex items-center justify-center'
                        >
                            <FloatingArrow
                                ref={arrowRef}
                                context={context}
                                fill='var(--theme-background)'
                                stroke='var(--theme-border)'
                            />
                            {content}
                        </div>
                    </div>
                </FloatingFocusManager>
            )}
        </>
    )
}