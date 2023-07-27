import {
    useFloating, useDismiss, useInteractions,
    flip, shift, inline, autoUpdate
} from '@floating-ui/react'
import { ReactNode, useEffect, useState } from 'react'

type TargetRect = {
    x: number,
    y: number,
    width: number,
    height: number,
    top: number,
    right: number,
    bottom: number,
    left: number,
}
// type ClientRects = {
//     readonly length: number,
//     item(index: number): TargetRect | null,
//     [index: number]: TargetRect,
// }
// TODO: veryfy that ClientRects is correct
type ClientRects = TargetRect[]
export type VirtualElement = {
    getBoundingClientRect(): TargetRect,
    getClientRects?(): ClientRects,
}

export function useOverlay({ }: {

}) {
    const [isOpen, setIsOpen] = useState(false)

    const { refs, floatingStyles, context } = useFloating({
        placement: 'bottom',
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [inline(), flip(), shift()],
        whileElementsMounted: autoUpdate
    })

    const dismiss = useDismiss(context)

    const { getFloatingProps } = useInteractions([dismiss])

    function setAnchor(anchor?: VirtualElement) {
        // TODO: make sure we need this timeout
        setTimeout(() => {
            if (!anchor) {
                setIsOpen(false)
            } else {
                refs.setReference(anchor)
                setIsOpen(true)
            }
        })
    }

    function makeNode(children: ReactNode): ReactNode {
        return isOpen ? (
            <div
                ref={refs.setFloating}
                style={{
                    ...floatingStyles,
                }}
                {...getFloatingProps()}
            >
                {children}
            </div>
        ) : null
    }

    return {
        makeNode, setAnchor,
    }
}

function App() {
    const [isOpen, setIsOpen] = useState(false)

    const { refs, floatingStyles, context } = useFloating({
        placement: 'top',
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [inline(), flip(), shift()],
        whileElementsMounted: autoUpdate
    })

    const dismiss = useDismiss(context)

    const { getFloatingProps } = useInteractions([dismiss])

    useEffect(() => {
        function handleMouseUp(event: MouseEvent) {
            if (refs.floating.current?.contains(event.target as Element | null)) {
                return
            }

            setTimeout(() => {
                const selection = window.getSelection()
                const range =
                    typeof selection?.rangeCount === 'number' && selection.rangeCount > 0
                        ? selection.getRangeAt(0)
                        : null

                if (selection?.isCollapsed) {
                    setIsOpen(false)
                    return
                }

                if (range) {
                    refs.setReference({
                        getBoundingClientRect: () => range.getBoundingClientRect(),
                        getClientRects: () => range.getClientRects()
                    })
                    setIsOpen(true)
                }
            })
        }

        function handleMouseDown(event: MouseEvent) {
            if (refs.floating.current?.contains(event.target as Element | null)) {
                return
            }

            if (window.getSelection()?.isCollapsed) {
                setIsOpen(false)
            }
        }

        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousedown', handleMouseDown)

        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mousedown', handleMouseDown)
        }
    }, [refs])

    return (
        <div className="App">
            <h1>Floating UI — Text Selection</h1>
            <div>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industrys standard dummy text ever
                since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not only five
                centuries, but also the leap into electronic typesetting, remaining
                essentially unchanged. It was popularised in the 1960s with the release
                of Letraset sheets containing Lorem Ipsum passages, and more recently
                with desktop publishing software like Aldus PageMaker including versions
                of Lorem Ipsum.
            </div>
            {isOpen && (
                <div
                    ref={refs.setFloating}
                    style={{
                        ...floatingStyles,
                        background: 'black',
                        color: 'white',
                        padding: 4
                    }}
                    {...getFloatingProps()}
                >
                    Floating
                </div>
            )}
        </div>
    )
}
