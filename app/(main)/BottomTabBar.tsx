'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { feedHref, notesHref, collectionsHref, historyHref, profileHref } from '@/common/href'
import { BookIcon, NotesIcon, CollectionIcon, HistoryIcon, ProfileIcon, SearchIcon } from '@/components/Icons'
import { useSearchModalState, useSearchHotkey, SearchModal } from './SearchModal'
import styles from './MainLayout.module.css'

const tabs = [
    { label: 'Feed', href: feedHref(), icon: <BookIcon /> },
    { label: 'Notes', href: notesHref(), icon: <NotesIcon /> },
    { label: 'Collections', href: collectionsHref(), icon: <CollectionIcon /> },
    { label: 'History', href: historyHref(), icon: <HistoryIcon /> },
    { label: 'Profile', href: profileHref(), icon: <ProfileIcon /> },
]

export function BottomTabBar({ showSearch }: { showSearch?: boolean }) {
    const pathname = usePathname()
    const { isOpen, openModal, closeModal } = useSearchModalState()
    useSearchHotkey({ isOpen, openModal, closeModal })

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
        {showSearch && <>
            <button
                className={`${styles.tab} bg-transparent border-none cursor-pointer`}
                onClick={openModal}
                aria-label="Search"
            >
                <div className={`${styles.tabIcon} p-0.5`}><SearchIcon /></div>
            </button>
            <SearchModal isOpen={isOpen} closeModal={closeModal} />
        </>}
    </nav>
}
