'use client'

import { useSearchModalState, useSearchHotkey, SearchModal } from './SearchModal'
import styles from './MainLayout.module.css'

export function Search() {
    const { isOpen, openModal, closeModal } = useSearchModalState()
    useSearchHotkey({ isOpen, openModal, closeModal })
    return <>
        <div className={`${styles.searchBox} relative items-center cursor-pointer`} onClick={openModal}>
            <input
                className='font-normal text-base rounded px-3 py-1.5 w-36 bg-background text-primary cursor-pointer
                border border-border
                focus:max-w-auto focus:outline-hidden focus:ring-0
                placeholder:text-dimmed'
                type="text"
                placeholder="Search..."
                readOnly
            />
            <kbd className='absolute right-2 text-xs text-dimmed px-1 py-0.5 pointer-events-none'>
                ⌘K
            </kbd>
        </div>
        <SearchModal
            isOpen={isOpen}
            closeModal={closeModal}
        />
    </>
}
