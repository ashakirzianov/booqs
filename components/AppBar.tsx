import React from 'react';
import { meter } from '../controls/theme';
import { Logo } from '../controls/Logo';
import { Popovers } from '../controls/Popover';
import { Search } from './Search';
import { SignIn } from './SignIn';
import { Themer } from './Themer';
import { Upload } from './Upload';

const headerHeight = '4rem';
export function AppBar() {
    return <div className="container">
        <div className="logo">
            <Logo />
        </div>
        <div className="search">
            <Search />
        </div>
        <div className="buttons">
            <AppButtons />
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                align-items: center;
                height: ${headerHeight};
                padding: 0 ${meter.large};
            }
            .logo {
                display: flex;
                flex-direction: column;
                flex: 0 0;
                margin: 0 ${meter.xLarge} 0 0;
            }
            @media (max-width: 40rem) {
                .logo {
                    display: none;
                }
                .container {
                    padding: ${meter.xLarge} ${meter.regular};
                }
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
                max-width: 10rem;
            }
            `}</style>
    </div>;
}

function AppButtons() {
    return <div className='buttons-row'>
        <Popovers>
            {singleton => <>
                <Upload singleton={singleton} />
                <Themer singleton={singleton} />
                <SignIn singleton={singleton} />
            </>}
        </Popovers>
        <style jsx>{`
            .buttons-row {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                align-items: center;
            }
            `}</style>
    </div>;
}
