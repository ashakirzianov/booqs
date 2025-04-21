import { AppBar } from '@/components/AppBar'
import { Search } from '@/components/Search'
import { SignInButton } from '@/components/SignInModal'
import { UploadButton } from '@/components/Upload'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return <section className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <AppBar
            left={<Search />}
            right={<>
                <UploadButton />
                <SignInButton />
            </>}
        />
        {children}
    </section>
}