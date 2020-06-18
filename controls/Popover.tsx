import React, { ReactNode, ReactElement } from 'react';
import { roundArrow } from 'tippy.js';
import Tippy, { useSingleton } from '@tippyjs/react';
import css from 'styled-jsx/css'
import { panelShadow, radius, vars } from './theme';

export type PopoverSingleton = ReturnType<typeof useSingleton>[1];

// TODO: combine 'Popover' & 'Overlay' ?
export function Overlay({ anchor, content }: {
    anchor: ReactElement,
    content: ReactNode,
}) {
    return <div>
        <Tippy
            arrow={false}
            interactive={true}
            placement='bottom'
            visible={true}
            animation='shift-away'
            content={<>{content}</>}
            children={anchor}
        />
        <style jsx global>{popoverStyles}</style>
    </div>;
}

// TODO: rethink div wrapping
export function Popover({ singleton, anchor, content }: {
    singleton?: PopoverSingleton,
    anchor: ReactNode,
    content: ReactNode,
}) {
    return <div>
        <Tippy
            singleton={singleton}
            content={<div className='content'>
                {content}
            </div>}
            children={<div>{anchor}</div>}
        />
        <style jsx>{`
            .content {
                display: flex;
                min-width: 15rem;
                flex: 1;
            }
        `}</style>
    </div>;
}

export function usePopoverSingleton() {
    const [source, target] = useSingleton();
    const SingletonNode = <>
        <Tippy
            singleton={source}
            popperOptions={{ strategy: 'fixed' }}
            arrow={roundArrow + roundArrow}
            placement='bottom'
            interactive={true}
            hideOnClick={true}
            animation='shift-away'
        />
        <style jsx global>{popoverStyles}</style>
    </>;
    return {
        SingletonNode,
        singleton: target,
    };
}

const popoverStyles = css.global`
.tippy-box {
    color: var(${vars.primary});
    background-color: var(${vars.background});
    box-shadow: ${panelShadow};
    border: 1px solid var(${vars.border});
    border-radius: ${radius};
}
.tippy-content {
    padding: 0;
    overflow: hidden;
    border-radius: ${radius};
}
.tippy-svg-arrow > svg:first-child {
    fill: var(${vars.border});
}
.tippy-svg-arrow > svg:last-child {
    fill: var(${vars.background});
}
`;
