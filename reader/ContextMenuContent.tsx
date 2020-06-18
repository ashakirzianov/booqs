import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import * as clipboard from 'clipboard-polyfill';
import { BooqRange, isOverlapping } from 'core';
import {
    useAuth, useHighlightMutations, useHighlights, Highlight, colorForGroup, groups,
} from 'app';
import { MenuItem } from 'controls/Menu';
import { useDocumentEvent } from 'controls/utils';
import { quoteRef } from 'controls/Links';
import { Icon } from 'controls/Icon';
import { meter, vars } from 'controls/theme';
import { BooqSelection } from './BooqContent';

export type ContextMenuTarget = {
    kind: 'selection',
    selection: BooqSelection,
}
export function ContextMenuContent({
    booqId, target: { selection },
}: {
    booqId: string,
    target: ContextMenuTarget,
}) {
    useCopyQuote(booqId, selection);
    return <>
        <HighlightsItems booqId={booqId} selection={selection} />
        <CopyQuoteItem booqId={booqId} selection={selection} />
        <CopyTextItem booqId={booqId} selection={selection} />
        <CopyLinkItem booqId={booqId} selection={selection} />
    </>;
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
    return `${baseUrl()}${quoteRef(booqId, range)}`;
}

function baseUrl() {
    const current = window.location;
    return `${current.protocol}//${current.host}`;
    // return process.env.NEXT_PUBLIC_URL;
}

function HighlightsItems({ booqId, selection }: {
    booqId: string,
    selection: BooqSelection,
}) {
    const { state } = useAuth();
    const { highlights } = useHighlights(booqId);
    const selected = highlights.filter(h => isOverlapping(selection.range, {
        start: h.start,
        end: h.end,
    }));
    if (state !== 'signed') {
        return null;
    } else if (selected.length) {
        return <>
            {
                selected.map(
                    (h, idx) => <ManageHighlightItem
                        key={idx} booqId={booqId} highlight={h}
                    />
                )
            }
        </>;
    } else {
        return <AddHighlightItem booqId={booqId} selection={selection} />;
    }
}

function AddHighlightItem({ booqId, selection }: {
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
            text: selection.text,
        })}
    />;
}

function ManageHighlightItem({ booqId, highlight }: {
    booqId: string,
    highlight: Highlight,
}) {
    const { removeHighlight, updateHighlight } = useHighlightMutations(booqId);
    return <div className='container'>
        {
            groups.map(
                (group, idx) => <CircleButton
                    key={idx}
                    color={colorForGroup(group)}
                    callback={() => updateHighlight(highlight.id, group)}
                />,
            )
        }
        <div key='remove' className='remove' onClick={() => removeHighlight(highlight.id)}>
            <Icon name='remove' />
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                padding: ${meter.large};
                cursor: pointer;
                font-size: small;
                user-select: none;
            }
            .remove {
                font-size: large;
            }
            .remove:hover {
                color: var(${vars.highlight});
            }
            `}</style>
    </div>;
}

const circleSize = '1.25rem';
function CircleButton({ color, callback }: {
    color: string,
    callback: () => void,
}) {
    return <div onClick={callback} className='button'>
        <style jsx>{`
            .button {
                background: ${color};
                border-radius: 50%;
                width: ${circleSize};
                height: ${circleSize};
                cursor: pointer;
            }
            .button:hover {
                border: 2px solid ${color};
            }
            `}</style>
    </div>;
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