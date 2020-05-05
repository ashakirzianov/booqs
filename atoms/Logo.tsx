import React from 'react';
import { brandColor } from './theme';

export function Logo() {
    return <span>
        BOOQS
        <style jsx>{`
            span {
                color: ${brandColor};
            }
        `}</style>
    </span>
}
