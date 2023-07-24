import { AppBar } from '@/components/AppBar'
import { Metadata } from 'next'
import { ReactNode } from 'react'

const title = 'Booqs'
const description = 'Your personal reading assistant'
export const metadata: Metadata = {
    title, description,
    openGraph: {
        title, description,
    },
    twitter: {
        title, description,
    },
}

export default function MainLayout({
    children, buttons, search, history,
}: {
    children: ReactNode,
    buttons?: ReactNode,
    search?: ReactNode,
    history?: ReactNode,
}) {
    return <div className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <AppBar AppButtons={buttons} Search={search} />
        {history}
        {children}
    </div>
}