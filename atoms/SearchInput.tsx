import React from 'react';
import { usePalette } from './theme';

export function SearchInput() {
    const { primary } = usePalette();
    return <>
        <input
            type="text"
        />
        <style jsx>{`
        input {
            color: ${primary};
        }
        `}</style>
    </>;
}
