import { ReactNode } from 'react'
import { AppBar } from '@/components/AppBar'
import { Search } from '@/components/Search'
import { UploadButton } from '@/components/Upload'
import { SignInButton } from '@/components/SignIn'
import { AppProvider } from '@/application/provider'

export default function MainLayout({
    children,
}: {
    children: ReactNode,
}) {
    return <div className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <AppProvider>
            <AppBar
                left={<Search />}
                right={<>
                    <UploadButton />
                    <SignInButton />
                </>}
            />
            {children}
        </AppProvider>
    </div>
}