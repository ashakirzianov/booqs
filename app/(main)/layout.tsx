import { ReactNode } from 'react'
import { AppButtons } from '@/components/AppButtons'
import { WiredSearch } from './client'
import { AppBar } from '@/components/AppBar'

export default function MainLayout({
    children,
}: {
    children: ReactNode,
}) {
    return <div className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <AppBar
            left={<WiredSearch />}
            right={<AppButtons />}
        />
        {children}
    </div>
}