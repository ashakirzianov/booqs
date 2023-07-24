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
    children, buttons,
}: {
    children: ReactNode,
    buttons?: ReactNode,
}) {
    return <div className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <AppBar AppButtons={buttons} />
        {children}
    </div>
}