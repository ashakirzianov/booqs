import React, { ReactNode } from 'react';
import { roundArrow } from 'tippy.js';
import Tippy, { useSingleton } from '@tippyjs/react';
import { usePalette } from '../app';
import { panelShadow, radius } from './theme';

export type PopoverSingleton = ReturnType<typeof useSingleton>[1];

export function Popover({ singleton, anchor, content }: {
    singleton?: PopoverSingleton,
    anchor: ReactNode,
    content: ReactNode,
}) {
    return <div>
        <Tippy
            singleton={singleton}
            content={<div className='anchor'>
                {content}
            </div>}
            children={<div>{anchor}</div>}
        />
        <style jsx>{`
            .anchor {
                display: flex;
                min-width: 15rem;
                flex: 1;
            }
        `}</style>
    </div>;
}

export function Popovers({ children }: {
    children: (singleton: PopoverSingleton) => ReactNode,
}) {
    const { primary, border, background } = usePalette();
    const [source, target] = useSingleton();
    return <>
        <Tippy
            singleton={source}
            popperOptions={{ strategy: 'fixed' }}
            arrow={roundArrow + roundArrow}
            placement='bottom'
            interactive={true}
            hideOnClick={true}
            animation='shift-away'
        />
        {children(target)}
        <style jsx global>{`
        .tippy-box {
            color: ${primary};
            background-color: ${background};
            box-shadow: ${panelShadow};
            border: 1px solid ${border};
            border-radius: ${radius};
        }
        .tippy-content {
            padding: 0;
            overflow: hidden;
            border-radius: ${radius};
        }
        .tippy-svg-arrow > svg:first-child {
            fill: ${border};
        }
        .tippy-svg-arrow > svg:last-child {
            fill: ${background};
        }
            `}</style>
    </>;
}
