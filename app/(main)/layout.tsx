import { AccountButton } from '@/components/AccountButton'
import { Search } from '@/components/Search'
import { UploadButton } from '@/components/Upload'
import { Logo } from '@/components/Logo'
import { MainMenu } from '@/components/MainMenu'
import { getCurrentUser } from '@/data/user'
import { hasReadingHistory } from '@/data/history'
import Link from 'next/link'
import { feedHref } from '@/common/href'
import styles from './MainLayout.module.css'

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const user = await getCurrentUser()
    const showHeaderSearch = await hasReadingHistory(user?.id)
    return <div className={`${styles.layout} font-normal font-main`}>
        <header className={styles.leftHeader}>
            <Link href={feedHref()}>
                <Logo />
            </Link>
            {showHeaderSearch && <Search />}
        </header>

        <header className={styles.rightHeader}>
            {user ? <UploadButton /> : null}
            <AccountButton user={user} />
        </header>

        <main className={styles.mainContent}>
            <div className={styles.contentInner}>
                {children}
            </div>
        </main>

        <aside className={styles.leftPanel}>
            {user && <MainMenu />}
        </aside>

        <aside className={styles.rightPanel}>
        </aside>
    </div>
}