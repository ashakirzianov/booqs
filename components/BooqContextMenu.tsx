// eslint-disable-next-line
import React from 'react';
import Tippy from '@tippyjs/react';
import { BooqSelection } from './BooqContent';
import { Menu, MenuItem } from 'controls/Menu';

export function BooqContextMenu({
    selection,
}: {
    selection: BooqSelection | undefined,
}) {
    if (!selection) {
        return null;
    }
    const { top, left, width, height } = selection.rect;
    return <Tippy
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
    </Tippy>;
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
