import React from 'react';
import { HasChildren } from './utils';
import { meter, radius } from './meter';
import { panelShadow } from './theme';

const panelWith = '40rem';

export function Panel({ children }: HasChildren) {
    return <div className="panel">
        {children}
        <style jsx>{`
            .panel {
                display: flex;
                flex-direction: row;
                flex: 0 1;
                width: 100%;
                max-width: ${panelWith};
                margin: ${meter.xLarge};
                border-radius: ${radius};
                overflow: hidden;
            }
            .panel:hover {
                box-shadow: ${panelShadow};
            }
            `}</style>
    </div>;
}
