import React, { ReactNode } from 'react';
import { roundArrow } from 'tippy.js';
import Tippy from '@tippyjs/react';
import { HasChildren } from './utils';
import { usePalette } from './theme';
import { radius, meter } from './meter';

export function WithPopover({
    body, placement, children,
}: HasChildren & {
    body: ReactNode,
    placement: 'bottom',
}) {
    const { primary, dimmed, background } = usePalette();
    return <>
        <Tippy
            popperOptions={{ strategy: 'fixed' }}
            arrow={roundArrow + roundArrow}
            placement={placement}
            interactive={true}
            hideOnClick={true}
            animation='shift-away'
            content={
                <div className="content">
                    {body}
                </div>
            }>
            <div>{children}</div>
        </Tippy>
        <style jsx>{`
        .content {
            padding: ${meter.large};
        }
            `}</style>
        <style jsx global>{`
        .tippy-box {
            color: ${primary};
            background-color: ${background};
            box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
            border-radius: ${radius};
            border: 1px solid ${dimmed};
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
