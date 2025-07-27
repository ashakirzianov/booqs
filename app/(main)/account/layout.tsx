import { redirect } from 'next/navigation'
import { accountHref } from '@/common/href'
import { ProfileIcon, UsersIcon, CollectionIcon, HistoryIcon } from '@/components/Icons'
import { AccountLink } from './AccountLink'
import styles from './AccountLayout.module.css'
import { getCurrentUser } from '@/data/user'

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()
    if (!user) {
        redirect('/auth')
    }

    return (
        <div className={styles.layout}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Left Sidebar */}
                    <nav className={styles.sidebar}>
                        <div className={styles.sidebarContent}>
                            <h2 className={styles.sidebarTitle}>Account</h2>
                            <ul className={styles.navList}>
                                <li className={styles.navItem}>
                                    <AccountLink href={accountHref({ section: 'profile' })} icon={<ProfileIcon />}>
                                        Profile
                                    </AccountLink>
                                </li>
                                <li className={styles.navItem}>
                                    <AccountLink href={accountHref({ section: 'followers' })} icon={<UsersIcon />}>
                                        Followers
                                    </AccountLink>
                                </li>
                                <li className={styles.navItem}>
                                    <AccountLink href={accountHref({ section: 'collections' })} icon={<CollectionIcon />}>
                                        Collections
                                    </AccountLink>
                                </li>
                                <li className={styles.navItem}>
                                    <AccountLink href={'/account/history'} icon={<HistoryIcon />}>
                                        History
                                    </AccountLink>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Main Content */}
                    <main className={styles.main}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}