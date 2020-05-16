import React, { ReactNode } from 'react';
import { roundArrow } from 'tippy.js';
import Tippy, { useSingleton } from '@tippyjs/react';
import { usePalette } from '../app';
import { panelShadow, radius } from './theme';

export type PopoverItem = {
    anchor: ReactNode,
    body: ReactNode,
};
export function Popovers({ items }: {
    items: PopoverItem[],
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
        {
            items.map(
                ({ anchor, body }, idx) => body
                    ? <div key={idx}>
                        <Tippy
                            singleton={target}
                            content={<div className="body">
                                {body}
                            </div>}
                            children={<div>{anchor}</div>}
                        />
                    </div>
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
