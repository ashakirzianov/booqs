import React, { useCallback, ReactNode, useRef, useState } from 'react';
import { useDocumentEvent } from 'controls/utils';
import { vars, radius, meter } from 'controls/theme';
import { Overlay } from 'controls/Popover';
import { BooqSelection, getBooqSelection } from './BooqContent';
import { ContextMenuContent } from './ContextMenuContent';

export function ContextMenu({ booqId }: {
    booqId: string,
}) {
    const { rect, selection } = useSelectionState() ?? {};
    if (rect && selection) {
        return <ContextMenuLayout
            rect={rect}
            content={<ContextMenuContent
                booqId={booqId}
                target={{
                    kind: 'selection',
                    selection: selection,
                }}
            />}
        />;
    } else {
        return null;
    }
}

type SelectionState = {
    selection: BooqSelection,
    rect: SelectionRect,
};
function useSelectionState() {
    const [selectionState, setSelectionState] = useState<SelectionState | undefined>(undefined);
    const locked = useRef(false);
    const unhandled = useRef(false);
    const lock = useCallback(() => locked.current = true, [locked]);
    const unlock = useCallback(() => {
        locked.current = false;
        if (unhandled.current) {
            setSelectionState(getSelection());
            unhandled.current = false;
        }
    }, [locked, unhandled]);
    useDocumentEvent('mouseup', unlock);
    useDocumentEvent('mousemove', useCallback(event => {
        if (event.buttons) {
            lock();
        } else {
            unlock();
        }
    }, [lock, unlock]));

    const selectionHandler = useCallback(event => {
        if (!locked.current) {
            setSelectionState(getSelection());
        } else {
            unhandled.current = true;
        }
    }, []);

    // Note: handle click as workaround for dead context menu
    useDocumentEvent('click', selectionHandler);
    useDocumentEvent('selectionchange', selectionHandler);

    useDocumentEvent('scroll', useCallback(event => {
        if (selectionState) {
            const rect = getSelectionRect();
            if (rect) {
                setSelectionState({
                    ...selectionState,
                    rect,
                });
            } else {
                console.log('unexpected');
            }
        }
    }, [selectionState]));

    return selectionState;
}

function getSelection() {
    const rect = getSelectionRect();
    if (rect) {
        const selection = getBooqSelection();
        if (selection) {
            return { rect, selection };
        }
    }
    return undefined;
}

function ContextMenuLayout({ content, rect }: {
    content: ReactNode,
    rect: SelectionRect,
}) {
    const isSmall = useIsSmallScreen();
    if (!isSmall) {
        return <ContextMenuPopover
            content={content}
            rect={rect}
        />;
    }
    return <div className='container'>
        <div className='content'>{content}</div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                height: 100%;
                align-self: stretch;
                pointer-events: none;
                flex-flow: column;
                justify-content: flex-end;
                align-items: stretch;
                user-select: none;
            }
            .content {
                pointer-events: auto;
                background: var(${vars.background});
                border-radius: ${radius};
                border: 1px solid var(${vars.border});
                padding-bottom: ${meter.xLarge};
            }
            `}</style>
    </div>;
}

function useIsSmallScreen() {
    return window.innerWidth < 800;
}

function ContextMenuPopover({
    content, rect: { top, left, width, height },
}: {
    content: ReactNode,
    rect: SelectionRect,
}) {
    return <Overlay
        content={<div style={{
            width: '12rem',
            pointerEvents: 'auto',
        }}>
            {content}
        </div>}
        anchor={<div style={{
            position: 'fixed',
            pointerEvents: 'none',
            top, left, width, height,
        }} />}
    />;
}

type SelectionRect = {
    top: number,
    left: number,
    height: number,
    width: number,
};
function getSelectionRect() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0)
            ?.getBoundingClientRect();
        return rect
            ? {
                top: rect.top, left: rect.left,
                height: rect.height, width: rect.width,
            } : undefined;
    } else {
        return undefined;
    }
}
