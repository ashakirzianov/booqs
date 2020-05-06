import React from 'react';
import { usePalette } from './theme';
import { meter } from './meter';
import { Icon } from './Icon';

export function SearchInput() {
    const { primary } = usePalette();
    return <div>
        <input
            type="text"
            placeholder="Search..."
        />
        <style jsx>{`
        div {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin: 0 ${meter.xLarge};
            color: ${primary};
        }
        input {
            border: none;
            padding: 0;
            margin: 0 ${meter.regular};
            font: inherit;
            font-size: xx-large;
        }
        input::placeholder {
        }
        `}</style>
    </div>;
}
