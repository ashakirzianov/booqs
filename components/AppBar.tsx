import React from 'react';
import { meter, headerHeight } from 'controls/theme';
import { Logo } from 'controls/Logo';
import { usePopoverSingleton } from 'controls/Popover';
import { Search } from './Search';
import { SignIn } from './SignIn';
import { Themer } from './Themer';
import { Upload } from './Upload';


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
                padding: ${meter.xLarge} ${meter.regular};
            }
            .logo {
                display: none;
                flex-direction: column;
                flex: 0 0;
                margin: 0 ${meter.xLarge} 0 0;
            }
            @media (min-width: 40rem) {
                .logo {
                    display: flex;
                }
                .container {
                    padding: ${meter.xLarge} ${meter.large};
                }
            }
            .search {
                display: flex;
                flex-direction: column;
                flex: 1;
            }
            .buttons {
                display: flex;
                flex-direction: column;
                flex: 1;
                max-width: 12rem;
            }
            `}</style>
    </div>;
}

function AppButtons() {
    const { singleton, SingletonNode } = usePopoverSingleton();
    return <div className='buttons-row'>
        {SingletonNode}
        <Upload singleton={singleton} />
        <Themer singleton={singleton} />
        <SignIn singleton={singleton} />
        <style jsx>{`
            .buttons-row {
                display: flex;
                flex: 1;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
            `}</style>
    </div>;
}
