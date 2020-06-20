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
    selection: BooqSelection,
};
type HighlightTarget = {
    kind: 'highlight',
    highlight: Highlight,
};
export type ContextMenuTarget =
    | EmptyTarget | SelectionTarget | QuoteTarget | HighlightTarget;

export function ContextMenuContent({
    target, ...rest
}: {
    target: ContextMenuTarget,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    switch (target.kind) {
        case 'selection':
            return <SelectionTargetMenu target={target} {...rest} />;
        case 'quote':
            return <QuoteTargetMenu target={target} {...rest} />;
        case 'highlight':
            return <HighlightTargetMenu target={target} {...rest} />;
        default:
            return null;
    }
}

function SelectionTargetMenu({
    target: { selection }, ...rest
}: {
    target: SelectionTarget,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    useCopyQuote(rest.booqId, selection);
    return <>
        <AddHighlightItem {...rest} selection={selection} />
        <CopyQuoteItem {...rest} selection={selection} />
        <CopyTextItem {...rest} selection={selection} />
        <CopyLinkItem {...rest} selection={selection} />
    </>;
}

function QuoteTargetMenu({
    target: { selection }, ...rest
}: {
    target: QuoteTarget,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    return <>
        <AddHighlightItem {...rest} selection={selection} />
        <CopyTextItem {...rest} selection={selection} />
    </>;
}

function HighlightTargetMenu({
    target: { highlight }, ...rest
}: {
    target: HighlightTarget,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const selection = {
        range: {
            start: highlight.start,
            end: highlight.end,
        },
        text: highlight.text,
    };
    return <>
        <SelectHighlightGroupItem  {...rest} highlight={highlight} />
        <CopyQuoteItem {...rest} selection={selection} />
        <CopyLinkItem {...rest} selection={selection} />
    </>;
}

function AddHighlightItem({
    selection, booqId, setTarget,
}: {
    selection: BooqSelection,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { addHighlight } = useHighlightMutations(booqId);
    return <MenuItem
        text='Highlight'
        icon='highlight'
        callback={() => {
            const highlight = addHighlight({
                group: 'first',
                start: selection.range.start,
                end: selection.range.end ?? selection.range.start,
                text: selection.text,
            });
            setTarget({
                kind: 'highlight',
                highlight,
            });
        }}
    />;
}

function SelectHighlightGroupItem({
    highlight, booqId,
}: {
    highlight: Highlight,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
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

function CopyQuoteItem({
    selection, booqId, setTarget,
}: {
    selection: BooqSelection,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
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
            setTarget({ kind: 'empty' });
        }}
    />;
}

function CopyTextItem({
    selection, setTarget,
}: {
    selection: BooqSelection,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    return <MenuItem
        text='Copy text'
        icon='copy'
        callback={() => {
            const text = selection.text;
            clipboard.writeText(text);
            removeSelection();
            setTarget({ kind: 'empty' });
        }}
    />;
}

function CopyLinkItem({
    selection, booqId, setTarget,
}: {
    selection: BooqSelection,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
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
            setTarget({ kind: 'empty' });
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
    return `"${text}"\n${link}`;
}

function generateLink(booqId: string, range: BooqRange) {
    return `${baseUrl()}${quoteRef(booqId, range)}`;
}

function baseUrl() {
    const current = window.location;
    return `${current.protocol}//${current.host}`;
}
