'use client'
import { feedHref, collectionsHref, followersHref, historyHref, notesHref, profileHref } from '@/common/href'
import { BookIcon, CollectionIcon, UsersIcon, HistoryIcon, NotesIcon, ProfileIcon, SearchIcon } from '@/components/Icons'
import { MenuLink } from './MenuLink'
import { useSearchModalState, useSearchHotkey, SearchModal } from './SearchModal'

const menuIconSize = '2rem'

const menuItems = [
    { label: 'Feed', href: feedHref(), icon: <BookIcon /> },
    { label: 'Notes', href: notesHref(), icon: <NotesIcon /> },
    { label: 'Collections', href: collectionsHref(), icon: <CollectionIcon /> },
    { label: 'Followers', href: followersHref(), icon: <UsersIcon /> },
    { label: 'History', href: historyHref(), icon: <HistoryIcon /> },
    { label: 'Profile', href: profileHref(), icon: <ProfileIcon /> },
]

export function MainMenu({ showSearch }: { showSearch?: boolean }) {
    return <nav className="flex flex-col">
        {showSearch && <SearchMenuButton />}
        {menuItems.map(({ label, href, icon }) => (
            <MenuLink key={href} href={href} icon={icon}>
                {label}
            </MenuLink>
        ))}
    </nav>
}

function SearchMenuButton() {
    const { isOpen, openModal, closeModal } = useSearchModalState()
    useSearchHotkey({ isOpen, openModal, closeModal })
    return <div className="hidden medium:block large:hidden">
        <button
            onClick={openModal}
            className="flex items-center gap-3 px-lg py-1 rounded-md transition-colors text-dimmed hover:text-action hover:bg-background-secondary w-full cursor-pointer bg-transparent border-none"
            style={{ fontFamily: 'inherit' }}
        >
            <div className="shrink-0 p-0.5" style={{ width: menuIconSize, height: menuIconSize }}>
                <SearchIcon />
            </div>
            <span className="hidden large:inline">Search</span>
        </button>
        <SearchModal isOpen={isOpen} closeModal={closeModal} />
    </div>
}