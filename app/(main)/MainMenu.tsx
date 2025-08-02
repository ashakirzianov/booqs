'use client'
import { feedHref, collectionsHref, followersHref, historyHref, notesHref, profileHref } from '@/common/href'
import { BookIcon, CollectionIcon, UsersIcon, HistoryIcon, NotesIcon, ProfileIcon } from '@/components/Icons'
import { MenuLink } from './MenuLink'

const menuItems = [
    { label: 'Feed', href: feedHref(), icon: <BookIcon /> },
    { label: 'Notes', href: notesHref(), icon: <NotesIcon /> },
    { label: 'Collections', href: collectionsHref(), icon: <CollectionIcon /> },
    { label: 'Followers', href: followersHref(), icon: <UsersIcon /> },
    { label: 'History', href: historyHref(), icon: <HistoryIcon /> },
    { label: 'Profile', href: profileHref(), icon: <ProfileIcon /> },
]

export function MainMenu() {
    return <nav className="flex flex-col">
        {menuItems.map(({ label, href, icon }) => (
            <MenuLink key={href} href={href} icon={icon}>
                {label}
            </MenuLink>
        ))}
    </nav>
}