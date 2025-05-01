import { AccountButton } from '@/components/AccountButton'
import { AppBar } from '@/components/AppBar'
import { Search } from '@/components/Search'
import { UploadButton } from '@/components/Upload'
import { fetchAuthData } from '@/data/auth'

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const user = await fetchAuthData()
    return <section className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <AppBar
            left={<Search />}
            right={<>
                {user ? <UploadButton /> : null}
                <AccountButton user={user} />
            </>}
        />
        {children}
    </section>
}