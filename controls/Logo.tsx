import React from 'react';
import { logoFont, normalWeight } from './theme';

export function Logo() {
    return <div>
        BOOQS
        <style jsx>{`
            div {
                color: rgba(253,163,2,1);
                font-family: ${logoFont};
                font-size: x-large;
                font-weight: ${normalWeight};
                background: -webkit-linear-gradient(180deg, rgba(253,163,2,1) 50%, rgb(200, 145, 2) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                cursor: default;
                user-select: none;
            }
        `}</style>
    </div>
}
