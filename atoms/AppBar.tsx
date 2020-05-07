import React from 'react';
import { headerHeight, meter } from './meter';
import { Logo } from './Logo';
import { SearchInput } from './SearchInput';
import { IconButton } from './IconButton';
import { SignInButton } from './SignIn';
import { ThemerButton } from './Themer';

export function AppBar() {
    return <div className="container">
        <div className="logo">
            <Logo />
        </div>
        <div className="search">
            <SearchInput />
        </div>
        <div className="buttons">
            <div className="buttons-row">
                <IconButton icon="upload" />
                <ThemerButton />
                <SignInButton />
            </div>
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                flex: 1 1;
                height: ${headerHeight};
                padding: ${meter.xLarge};
                align-items: center;
            }
            .logo {
                display: flex;
                flex-direction: column;
                flex: 0 0;
            }
            .search {
                display: flex;
                flex-direction: column;
                flex: 1 1;
            }
            .buttons {
                display: flex;
                flex-direction: column;
                flex: 1 0;
            }
            .buttons-row {
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            `}</style>
    </div>;
}
