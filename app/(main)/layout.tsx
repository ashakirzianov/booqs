import { ReactNode } from 'react'

export default function MainLayout({
    children,
}: {
    children: ReactNode,
}) {
    return <div className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        {children}
    </div>
}