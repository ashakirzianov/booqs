import React from 'react';
import { headerHeight } from './meter';
import { Logo } from './Logo';
import { SearchInput } from './SearchInput';
import { IconButton } from './IconButton';

export function AppBar() {
    return <div>
        <Logo />
        <SearchInput />
        <IconButton icon="upload" />
        <IconButton icon="appearance" />
        <IconButton icon="sign-in" />
        <style jsx>{`
            div {
                display: flex;
                flex-direction: row;
                height: ${headerHeight};
            }
            `}</style>
    </div>;
}
