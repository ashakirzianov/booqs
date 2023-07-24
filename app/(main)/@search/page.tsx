'use client'
import { AppProvider } from '@/application'
import { Search } from '@/components/Search'

export default function SearchField() {
    return <AppProvider>
        <Search />
    </AppProvider>
}