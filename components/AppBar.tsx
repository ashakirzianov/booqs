import React from 'react'
import { Logo } from '@/controls/Logo'
import { usePopoverSingleton } from '@/controls/Popover'
import { Search } from './Search'
import { SignIn } from './SignIn'
import { Themer } from './Themer'
import { Upload } from './Upload'


export function AppBar() {
    return <div className="flex flex-row items-center w-screen h-header py-xl px-base sm:py-xl sm:px-lg">
        <div className="mr-xl hidden sm:flex grow-0">
            <Logo />
        </div>
        <div className="flex grow">
            <Search />
        </div>
        <div className="flex flex-col">
            <AppButtons />
        </div>
    </div>
}

function AppButtons() {
    const { singleton, SingletonNode } = usePopoverSingleton()
    return <div className='flex flex-row grow justify-between items-center gap-4'>
        {SingletonNode}
        <Upload singleton={singleton} />
        <Themer singleton={singleton} />
        <SignIn singleton={singleton} />
    </div>
}
