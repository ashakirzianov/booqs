import React, { useCallback, ReactNode, useRef, useState } from 'react';
import { useDocumentEvent, isSmallScreen } from 'controls/utils';
import { vars, radius } from 'controls/theme';
import { Overlay } from 'controls/Popover';
import { getBooqSelection } from './BooqContent';
import { ContextMenuContent, ContextMenuTarget } from './ContextMenuContent';

export function useContextMenu(booqId: string) {
    const selectionState = useMenuState();
    const ContextMenuNode = <ContextMenu
        booqId={booqId}
        menuState={selectionState}
    />;

    return {
        isVisible: !!selectionState,
        ContextMenuNode,
    };
}

function ContextMenu({
    booqId, menuState: { rect, target },
}: {
    booqId: string,
    menuState: MenuState,
}) {
    return <ContextMenuLayout
        rect={rect}
        content={<ContextMenuContent
            booqId={booqId}
            target={target}
        />}
    />;
}

type MenuState = {
    target: ContextMenuTarget,
    rect?: SelectionRect,
};
function useMenuState() {
    const [state, setState] = useState<MenuState>({
        target: { kind: 'empty' },
    });
    const locked = useRef(false);
    const unhandled = useRef(false);
    const lock = useCallback(() => locked.current = true, [locked]);
    const unlock = useCallback(() => {
        locked.current = false;
        if (unhandled.current) {
            setState(getSelectionState());
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
            setState(getSelectionState());
        } else {
            unhandled.current = true;
        }
    }, []);

    // Note: handle click as workaround for dead context menu
    useDocumentEvent('click', selectionHandler);
    useDocumentEvent('selectionchange', selectionHandler);

    useDocumentEvent('scroll', useCallback(() => {
        setState({
            target: { kind: 'empty' },
        });
    }, []));

    return state;
}

function getSelectionState(): MenuState {
    const rect = getSelectionRect();
    if (rect) {
        const selection = getBooqSelection();
        if (selection) {
            return {
                rect,
                target: {
                    kind: 'selection',
                    selection,
                },
            };
        }
    }
    return {
        target: { kind: 'empty' },
    };
}

function ContextMenuLayout({ content, rect }: {
    content: ReactNode,
    rect?: SelectionRect,
}) {
    const isSmall = isSmallScreen();
    if (!isSmall) {
        return rect
            ? <ContextMenuPopover
                content={content}
                rect={rect}
            />
            : null;
    }
    const visibility = rect ? '' : 'hidden';
    return <div className='container'>
        <div className={`content ${visibility}`}>{content}</div>
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
                padding-bottom: env(safe-area-inset-bottom);
                transition: 250ms transform;
            }
            .content.hidden {
                transform: translateY(100%);
            }
            `}</style>
    </div>;
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
