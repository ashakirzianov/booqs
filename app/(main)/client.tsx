'use client'
import { AppProvider } from '@/application/provider'
import { useSearch } from '@/application/search'
import { Search } from '@/components/Search'
import { SignInButton } from '@/components/SignIn'
import { UploadButton } from '@/components/Upload'

export function AppButtons() {
    return <AppProvider>
        <UploadButton />
        <SignInButton />
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