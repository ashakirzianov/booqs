import React from 'react';
import { headerHeight, meter } from './meter';
import { Logo } from './Logo';
import { SearchInput } from './SearchInput';
import { IconButton } from './IconButton';
import { SignInPanel } from './SignIn';
import { ThemerPanel } from './Themer';
import { Popovers } from './Popover';

export function AppBar() {
    return <div className="container">
        <div className="logo">
            <Logo />
        </div>
        <div className="search">
            <SearchInput />
        </div>
        <div className="buttons">
            <AppButtons />
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
            `}</style>
    </div>;
}

function AppButtons() {
    return <div className='buttons-row'>
        <Popovers
            items={[
                {
                    anchor: <IconButton icon='upload' />,
                    body: null,
                },
                {
                    anchor: <IconButton icon='appearance' />,
                    body: <ThemerPanel />,
                },
                {
                    anchor: <IconButton icon='sign-in' />,
                    body: <SignInPanel />,
                },
            ]}
        />
        <style jsx>{`
            .buttons-row {
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            `}</style>
    </div>;
}
