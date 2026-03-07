'use client'

import { useSearchModalState, useSearchHotkey, SearchModal } from './SearchModal'

export function Search() {
    const { isOpen, openModal, closeModal } = useSearchModalState()
    useSearchHotkey({ isOpen, openModal, closeModal })
    return <>
        <div className='relative flex items-center cursor-pointer' onClick={openModal}>
            <input
                className='font-normal text-xl shadow rounded p-4 max-h-12 w-40 bg-background text-primary cursor-pointer
                border border-border dark:shadow-slate-700 pr-16
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
