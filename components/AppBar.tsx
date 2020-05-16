import React from 'react';
import { headerHeight, meter } from '../controls/theme';
import { Logo } from '../controls/Logo';
import { Popovers } from '../controls/Popover';
import { IconButton } from '../controls/Buttons';
import { Search } from './Search';
import { SignInPanel, SingInButton } from './SignIn';
import { ThemerPanel } from './Themer';
import { UploadPanel } from './Upload';
import { useAuth } from '../app';

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
    const auth = useAuth();
    return <div className='buttons-row'>
        <Popovers
            items={[
                {
                    anchor: <IconButton icon='upload' />,
                    body: <UploadPanel />,
                },
                {
                    anchor: <IconButton icon='appearance' />,
                    body: <ThemerPanel />,
                },
                {
                    anchor: <SingInButton state={auth} />,
                    body: <SignInPanel state={auth} />,
                },
            ]}
        />
        <style jsx>{`
            .buttons-row {
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
            }
            `}</style>
    </div>;
}
