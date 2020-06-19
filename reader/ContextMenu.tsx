import React, { useCallback, ReactNode, useRef, useState } from 'react';
import { useDocumentEvent, isSmallScreen } from 'controls/utils';
import { vars, radius } from 'controls/theme';
import { Overlay } from 'controls/Popover';
import { getBooqSelection, AnchorRect, getSelectionRect } from './BooqContent';
import { ContextMenuContent, ContextMenuTarget } from './ContextMenuContent';

export function useContextMenu(booqId: string) {
    const { menuState, setMenuState } = useMenuState();
    const ContextMenuNode = <ContextMenu
        booqId={booqId}
        menuState={menuState}
    />;

    return {
        isVisible: menuState.target.kind !== 'empty',
        ContextMenuNode,
        setMenuState,
    };
}

function ContextMenu({
    booqId, menuState: { rect, target },
}: {
    booqId: string,
    menuState: ContextMenuState,
}) {
    return <ContextMenuLayout
        rect={rect}
        content={<ContextMenuContent
            booqId={booqId}
            target={target}
        />}
    />;
}

export type ContextMenuState = {
    target: ContextMenuTarget,
    rect?: AnchorRect,
};
function useMenuState() {
    const [menuState, setMenuState] = useState<ContextMenuState>({
        target: { kind: 'empty' },
    });
    const locked = useRef(false);
    const unhandled = useRef(false);
    const lock = useCallback(() => locked.current = true, [locked]);
    const unlock = useCallback(() => {
        locked.current = false;
        if (unhandled.current) {
            setMenuState(getSelectionState());
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
            setMenuState(getSelectionState());
        } else {
            unhandled.current = true;
        }
    }, []);

    useDocumentEvent('selectionchange', selectionHandler);

    useDocumentEvent('scroll', useCallback(() => {
        setMenuState({
            target: { kind: 'empty' },
        });
    }, []));

    return {
        menuState,
        setMenuState,
    };
}

function getSelectionState(): ContextMenuState {
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
    rect?: AnchorRect,
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
    rect: AnchorRect,
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
