import { AppBar } from '@/components/AppBar'
import { SignInButton } from '@/components/SignIn'
import { UploadButton } from '@/components/Upload'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return <section className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <AppBar
            right={<>
                <UploadButton />
                <SignInButton />
            </>}
        />
        {children}
    </section>
}