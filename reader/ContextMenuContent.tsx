import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import * as clipboard from 'clipboard-polyfill';
import { BooqRange } from 'core';
import {
    useHighlightMutations, Highlight, colorForGroup, groups,
} from 'app';
import { MenuItem } from 'controls/Menu';
import { useDocumentEvent } from 'controls/utils';
import { quoteRef } from 'controls/Links';
import { Icon } from 'controls/Icon';
import { meter, vars } from 'controls/theme';
import { BooqSelection } from './BooqContent';

type EmptyTarget = {
    kind: 'empty',
};
type SelectionTarget = {
    kind: 'selection',
    selection: BooqSelection,
};
type QuoteTarget = {
    kind: 'quote',
    quote: BooqSelection,
};
type HighlightTarget = {
    kind: 'highlight',
    highlight: Highlight,
};
export type ContextMenuTarget =
    | EmptyTarget | SelectionTarget | QuoteTarget | HighlightTarget;
export function ContextMenuContent({
    booqId, target,
}: {
    booqId: string,
    target: ContextMenuTarget,
}) {
    switch (target.kind) {
        case 'selection':
            return <SelectionTargetMenu
                booqId={booqId}
                target={target}
            />;
        case 'quote':
            return <QuoteTargetMenu
                booqId={booqId}
                target={target}
            />;
        case 'highlight':
            return <HighlightTargetMenu
                booqId={booqId}
                target={target}
            />;
        default:
            return null;
    }
}

function SelectionTargetMenu({ booqId, target: { selection } }: {
    booqId: string,
    target: SelectionTarget,
}) {
    useCopyQuote(booqId, selection);
    return <>
        <AddHighlightItem booqId={booqId} selection={selection} />
        <CopyQuoteItem booqId={booqId} selection={selection} />
        <CopyTextItem booqId={booqId} selection={selection} />
        <CopyLinkItem booqId={booqId} selection={selection} />
    </>;
}

function QuoteTargetMenu({ booqId, target: { quote } }: {
    booqId: string,
    target: QuoteTarget,
}) {
    return <>
        <AddHighlightItem booqId={booqId} selection={quote} />
        <CopyTextItem booqId={booqId} selection={quote} />
    </>;
}

function HighlightTargetMenu({ booqId, target: { highlight } }: {
    booqId: string,
    target: HighlightTarget,
}) {
    const selection = {
        range: { start: highlight.start, end: highlight.end },
        text: highlight.text,
    };
    return <>
        <SelectHighlightGroupItem booqId={booqId} highlight={highlight} />
        <CopyQuoteItem booqId={booqId} selection={selection} />
        <CopyLinkItem booqId={booqId} selection={selection} />
    </>;
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

function SelectHighlightGroupItem({ booqId, highlight }: {
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

function removeSelection() {
    window.getSelection()?.empty();
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
}
