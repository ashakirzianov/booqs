import React from 'react';
import { brandColor } from './theme';

export function Logo() {
    return <div>
        BOOQS
        <style jsx>{`
            div {
                color: ${brandColor};
                font: inherit;
                font-size: xx-large;
                font-weight: bold;
            }
        `}</style>
    </div>
}
