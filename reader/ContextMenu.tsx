import React, { useCallback, ReactNode, useState, useEffect } from 'react';
import { useDocumentEvent } from 'controls/utils';
import { vars, radius } from 'controls/theme';
import { Overlay } from 'controls/Popover';
import { BooqSelection } from './BooqContent';
import { ContextMenuContent } from './ContextMenuContent';

export function ContextMenu({ booqId, selection }: {
    booqId: string,
    selection: BooqSelection | undefined,
}) {
    if (selection) {
        return <ContextMenuLayout
            content={<ContextMenuContent
                booqId={booqId}
                target={{
                    kind: 'selection',
                    selection,
                }}
            />}
        />;
    } else {
        return null;
    }
}

function ContextMenuLayout({ content }: {
    content: ReactNode,
}) {
    const isSmall = useIsSmallScreen();
    if (!isSmall) {
        return <ContextMenuPopover
            content={content}
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
            }
            .content {
                pointer-events: auto;
                background: var(${vars.background});
                border-radius: ${radius};
                border: 1px solid var(${vars.border});
            }
            `}</style>
    </div>;
}

function useIsSmallScreen() {
    const result = window.innerWidth < 800;
    console.log(result, window.innerWidth);
    return result;
}

function ContextMenuPopover({
    content,
}: {
    content: ReactNode,
}) {
    const { top, left, width, height } = useSelectionRect() ?? {};
    if (top === undefined) {
        return null;
    }
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

function useSelectionRect(): SelectionRect | undefined {
    const [rect, setRect] = useState<SelectionRect | undefined>(undefined);
    useEffect(() => {
        setRect(getSelectionRect());
    });
    useDocumentEvent('scroll', useCallback(() => {
        setRect(getSelectionRect());
    }, [setRect]));
    return rect;
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
