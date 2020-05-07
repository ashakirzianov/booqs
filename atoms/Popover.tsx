import React, { ReactNode } from 'react';
import { roundArrow } from 'tippy.js';
import Tippy, { useSingleton } from '@tippyjs/react';
import { HasChildren } from './utils';
import { usePalette, panelShadow } from './theme';
import { radius } from './meter';

export type PopoverItem = {
    anchor: ReactNode,
    body: ReactNode,
};
export function Popovers({ items }: {
    items: PopoverItem[],
}) {
    const { primary, dimmed, background } = usePalette();
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
        {
            items.map(
                ({ anchor, body }, idx) => body
                    ? <Tippy
                        key={idx}
                        singleton={target}
                        content={<div className="body">
                            {body}
                        </div>}
                        children={<div>{anchor}</div>}
                    />
                    : anchor
            )
        }
        <style jsx>{`
            .body {
                display: flex;
                min-width: 15rem;
                flex: 1;
            }
            `}</style>
        <style jsx global>{`
        .tippy-box {
            color: ${primary};
            background-color: ${background};
            box-shadow: ${panelShadow};
            border: 1px solid ${dimmed};
            border-radius: ${radius};
        }
        .tippy-content {
            padding: 0;
            overflow: hidden;
            border-radius: ${radius};
        }
        .tippy-svg-arrow > svg:first-child {
            fill: ${dimmed};
        }
        .tippy-svg-arrow > svg:last-child {
            fill: ${background};
        }
            `}</style>
    </>;
}
