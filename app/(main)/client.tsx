'use client'
import { AppProvider } from '@/application/provider'
import { useSearch } from '@/application/search'
import { Search } from '@/components/Search'
import { SignIn } from '@/components/SignIn'
import { Upload } from '@/components/Upload'

export function AppButtons() {
    return <AppProvider>
        <Upload />
        <SignIn />
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