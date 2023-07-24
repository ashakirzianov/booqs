import React from 'react'
import { Logo } from '@/controls/Logo'
import { usePopoverSingleton } from '@/controls/Popover'
import { Search } from './Search'
import { SignIn } from './SignIn'
import { Themer } from './Themer'
import { Upload } from './Upload'


export function AppBar() {
    return <div className="appbar h-header py-xl px-base sm:py-xl sm:px-lg">
        <div className="logo mr-xl hidden sm:flex">
            <Logo />
        </div>
        <div className="search">
            <Search />
        </div>
        <div className="buttons">
            <AppButtons />
        </div>
        <style jsx>{`
            .appbar {
                display: flex;
                flex-direction: row;
                align-items: center;
                width: 100vw;
            }
            .logo {
                flex-direction: column;
                flex: 0 0;
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
    </div>
}

function AppButtons() {
    const { singleton, SingletonNode } = usePopoverSingleton()
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
    </div>
}
