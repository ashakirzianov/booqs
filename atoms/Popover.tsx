import React, { ReactNode } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/animations/shift-away.css';
import { HasChildren } from './utils';
import { usePalette, panelShadow } from './theme';
import { radius, meter } from './meter';

export function WithPopover({
    body, placement, children,
}: HasChildren & {
    body: ReactNode,
    placement: 'bottom',
}) {
    const { primary } = usePalette();
    return <>
        <Tippy
            // popperOptions={{ strategy: 'fixed' }}
            // arrow={true}
            // offset={[0, -10]}
            theme='custom'
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
        .tippy-box[data-theme~=\'custom\'] {
            z-index: 100;
            background-color: ${primary};
            box-shadow: ${panelShadow};
            border-radius: ${radius};
        }
        .content {
            z-index: 100;
            padding: ${meter.large};
        }
            `}</style>
    </>;
}
