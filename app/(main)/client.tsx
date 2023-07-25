'use client'
import { AppProvider, useSearch } from '@/application'
import { Search } from '@/components/Search'
import { SignIn } from '@/components/SignIn'
import { Upload } from '@/components/Upload'
import { usePopoverSingleton } from '@/controls/Popover'

export function AppButtons() {
    const { singleton, SingletonNode } = usePopoverSingleton()
    return <AppProvider>
        {SingletonNode}
        <Upload singleton={singleton} />
        <SignIn singleton={singleton} />
    </AppProvider>
}

export function WiredSearch() {
    return <AppProvider>
        <WiredSearchImpl />
    </AppProvider>
}

function WiredSearchImpl() {
    const params = useSearch()
    return <Search {...params} />
}