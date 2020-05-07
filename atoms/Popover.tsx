import React, { ReactNode } from 'react';
import { roundArrow } from 'tippy.js';
import Tippy from '@tippyjs/react';
import { HasChildren } from './utils';
import { usePalette } from './theme';
import { radius } from './meter';

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
                display: flex;
                min-width: 12rem;
                flex: 1;
            }
            `}</style>
        <style jsx global>{`
        .tippy-box {
            color: ${primary};
            background-color: ${background};
            box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
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
