'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { feedHref, notesHref, collectionsHref, historyHref, profileHref } from '@/common/href'
import { BookIcon, NotesIcon, CollectionIcon, HistoryIcon, ProfileIcon } from '@/components/Icons'
import styles from './MainLayout.module.css'

const tabs = [
    { label: 'Feed', href: feedHref(), icon: <BookIcon /> },
    { label: 'Notes', href: notesHref(), icon: <NotesIcon /> },
    { label: 'Collections', href: collectionsHref(), icon: <CollectionIcon /> },
    { label: 'History', href: historyHref(), icon: <HistoryIcon /> },
    { label: 'Profile', href: profileHref(), icon: <ProfileIcon /> },
]

export function BottomTabBar() {
    const pathname = usePathname()

    return <nav className={styles.bottomTabBar}>
        {tabs.map(({ label, href, icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return <Link
                key={href}
                href={href}
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                aria-label={label}
            >
                <div className={`${styles.tabIcon} p-0.5`}>{icon}</div>
            </Link>
        })}
    </nav>
}
