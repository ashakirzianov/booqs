// eslint-disable-next-line
import React, { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import { BooqSelection } from './BooqContent';
import { Menu, MenuItem } from 'controls/Menu';
import { eventSubscription } from 'controls/utils';
import { quoteRef } from 'controls/Links';
import { BooqRange } from 'core';

export function BooqContextMenu({
    booqId,
    selection,
}: {
    booqId: string,
    selection: BooqSelection | undefined,
}) {
    const rect = useSelectionRect(selection);
    useEffect(() => eventSubscription('copy', e => {
        if (selection && e.clipboardData) {
            e.preventDefault();
            const selectionText = generateQuote(selection.text, booqId, selection.range);
            e.clipboardData.setData('text/plain', selectionText);
        }
    }), [selection, booqId]);
    if (!rect || !selection) {
        return null;
    }
    const { top, left, width, height } = rect;
    return <div>
        <Tippy
            visible={true}
            interactive={true}
            arrow={false}
            placement='bottom'
            animation='shift-away'
            content={<ContextMenuContent selection={selection} />}
        >
            <div style={{
                position: 'fixed',
                pointerEvents: 'none',
                top, left, width, height,
            }} />
        </Tippy>
    </div>;
}

function generateQuote(text: string, booqId: string, range: BooqRange) {
    const link = generateLink(booqId, range);
    return `"${text}" ${link}`;
}

function generateLink(booqId: string, range: BooqRange) {
    return `${process.env.NEXT_PUBLIC_URL}${quoteRef(booqId, range)}`;
}

function useSelectionRect(selection: BooqSelection | undefined) {
    const [rect, setRect] = useState<SelectionRect>(undefined);
    useEffect(() => {
        if (selection) {
            setRect(getSelectionRect());
        }
    }, [selection]);
    useEffect(() => {
        function listener() {
            if (selection) {
                setRect(getSelectionRect());
            }
        }
        window.document.addEventListener('scroll', listener);
        return () => window.document.removeEventListener('scroll', listener);
    }, [setRect, selection]);
    return rect;
}

type SelectionRect = ReturnType<typeof getSelectionRect>;
function getSelectionRect() {
    const rect = window.getSelection()
        ?.getRangeAt(0)
        ?.getBoundingClientRect();
    return rect
        ? {
            top: rect.top, left: rect.left,
            height: rect.height, width: rect.width,
        } : undefined;
}

function ContextMenuContent({ selection }: {
    selection: BooqSelection,
}) {
    return <Menu width='10rem'>
        <CopyQuoteItem selection={selection} />
        <CopyTextItem selection={selection} />
        <CopyLinkItem selection={selection} />
    </Menu>;
}

function CopyQuoteItem({ selection }: {
    selection: BooqSelection,
}) {
    return <MenuItem
        text='Copy quote'
        icon='quote'
    />;
}

function CopyTextItem({ selection }: {
    selection: BooqSelection,
}) {
    return <MenuItem
        text='Copy text'
        icon='copy'
    />;
}

function CopyLinkItem({ selection }: {
    selection: BooqSelection,
}) {
    return <MenuItem
        text='Copy link'
        icon='link'
    />;
}
