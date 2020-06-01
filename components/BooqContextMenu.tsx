// eslint-disable-next-line
import React, { useState, useEffect, useCallback } from 'react';
import Tippy from '@tippyjs/react';
import * as clipboard from 'clipboard-polyfill';
import { BooqRange } from 'core';
import { BooqSelection } from './BooqContent';
import { Menu, MenuItem } from 'controls/Menu';
import { useDocumentEvent } from 'controls/utils';
import { quoteRef } from 'controls/Links';

export function BooqContextMenu({
    booqId,
    selection,
}: {
    booqId: string,
    selection: BooqSelection | undefined,
}) {
    const rect = useSelectionRect(selection);
    useCopyQuote(booqId, selection);
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
            content={<ContextMenuContent
                booqId={booqId} selection={selection}
            />}
        >
            <div style={{
                position: 'fixed',
                pointerEvents: 'none',
                top, left, width, height,
            }} />
        </Tippy>
    </div>;
}

function useSelectionRect(selection: BooqSelection | undefined) {
    const [rect, setRect] = useState<SelectionRect>(undefined);
    useEffect(() => {
        if (selection) {
            setRect(getSelectionRect());
        }
    }, [selection]);
    useDocumentEvent('scroll', useCallback(() => {
        if (selection) {
            setRect(getSelectionRect());
        }
    }, [setRect, selection]));
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

function useCopyQuote(booqId: string, selection?: BooqSelection) {
    useDocumentEvent('copy', useCallback(e => {
        if (selection && e.clipboardData) {
            e.preventDefault();
            const selectionText = generateQuote(booqId, selection.text, selection.range);
            e.clipboardData.setData('text/plain', selectionText);
        }
    }, [selection, booqId]));
}

function generateQuote(booqId: string, text: string, range: BooqRange) {
    const link = generateLink(booqId, range);
    return `"${text}" ${link}`;
}

function generateLink(booqId: string, range: BooqRange) {
    return `${process.env.NEXT_PUBLIC_URL}${quoteRef(booqId, range)}`;
}

function ContextMenuContent({ booqId, selection }: {
    booqId: string,
    selection: BooqSelection,
}) {
    return <Menu width='10rem'>
        <CopyQuoteItem booqId={booqId} selection={selection} />
        <CopyTextItem selection={selection} />
        <CopyLinkItem booqId={booqId} selection={selection} />
    </Menu>;
}

function CopyQuoteItem({ booqId, selection }: {
    booqId: string,
    selection: BooqSelection,
}) {
    return <MenuItem
        text='Copy quote'
        icon='quote'
        callback={() => {
            const quote = generateQuote(booqId, selection.text, selection.range);
            clipboard.writeText(quote);
        }}
    />;
}

function CopyTextItem({ selection }: {
    selection: BooqSelection,
}) {
    return <MenuItem
        text='Copy text'
        icon='copy'
        callback={() => {
            const text = selection.text;
            clipboard.writeText(text);
        }}
    />;
}

function CopyLinkItem({ booqId, selection }: {
    booqId: string,
    selection: BooqSelection,
}) {
    return <MenuItem
        text='Copy link'
        icon='link'
        callback={() => {
            const link = generateLink(booqId, selection.range);
            clipboard.writeText(link);
        }}
    />;
}