// eslint-disable-next-line
import React, { useState, useEffect, useCallback } from 'react';
import Tippy from '@tippyjs/react';
import * as clipboard from 'clipboard-polyfill';
import { BooqRange } from 'core';
import { BooqSelection } from './BooqContent';
import { Menu, MenuItem } from 'controls/Menu';
import { useDocumentEvent } from 'controls/utils';
import { quoteRef } from 'controls/Links';
import { useRouter } from 'next/router';
import { useHighlightMutations } from 'app/highlights';
import { useAuth } from 'app';

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
function removeSelection() {
    window.getSelection()?.empty();
}

function useCopyQuote(booqId: string, selection?: BooqSelection) {
    const { prefetch } = useRouter();
    useDocumentEvent('copy', useCallback(e => {
        if (selection && e.clipboardData) {
            e.preventDefault();
            const selectionText = generateQuote(booqId, selection.text, selection.range);
            e.clipboardData.setData('text/plain', selectionText);
            prefetch(quoteRef(booqId, selection.range));
        }
    }, [selection, booqId, prefetch]));
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
    const { state } = useAuth();
    return <Menu width='10rem'>
        {
            state === 'signed'
                ? <ManageHighlightsItem booqId={booqId} selection={selection} />
                : null
        }
        <CopyQuoteItem booqId={booqId} selection={selection} />
        <CopyTextItem booqId={booqId} selection={selection} />
        <CopyLinkItem booqId={booqId} selection={selection} />
    </Menu>;
}

function ManageHighlightsItem({ booqId, selection }: {
    booqId: string,
    selection: BooqSelection,
}) {
    const { addHighlight } = useHighlightMutations(booqId);
    return <MenuItem
        text='Highlight'
        icon='highlight'
        callback={() => addHighlight({
            group: 'first',
            start: selection.range.start,
            end: selection.range.end ?? selection.range.start,
        })}
    />;
}

function CopyQuoteItem({ booqId, selection }: {
    booqId: string,
    selection: BooqSelection,
}) {
    const { prefetch } = useRouter();
    return <MenuItem
        text='Copy quote'
        icon='quote'
        callback={() => {
            const quote = generateQuote(booqId, selection.text, selection.range);
            clipboard.writeText(quote);
            removeSelection();
            prefetch(quoteRef(booqId, selection.range));
        }}
    />;
}

function CopyTextItem({ selection }: {
    booqId: string,
    selection: BooqSelection,
}) {
    return <MenuItem
        text='Copy text'
        icon='copy'
        callback={() => {
            const text = selection.text;
            clipboard.writeText(text);
            removeSelection();
        }}
    />;
}

function CopyLinkItem({ booqId, selection }: {
    booqId: string,
    selection: BooqSelection,
}) {
    const { prefetch } = useRouter();
    return <MenuItem
        text='Copy link'
        icon='link'
        callback={() => {
            const link = generateLink(booqId, selection.range);
            clipboard.writeText(link);
            removeSelection();
            prefetch(quoteRef(booqId, selection.range));
        }}
    />;
}
