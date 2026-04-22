'use client'

import { SearchModal, useSearchHotkey, useSearchModalState } from './SearchModal'

export function ExploreSearch() {
    const { isOpen, openModal, closeModal } = useSearchModalState()
    useSearchHotkey({ isOpen, openModal, closeModal })
    return <>
        <input
            className='font-normal text-2xl shadow rounded-lg p-6 w-96 max-w-[90vw] bg-background text-primary cursor-pointer
            border border-border
            focus:max-w-auto focus:outline-hidden focus:ring-0
            placeholder:text-dimmed transition-shadow hover:shadow-lg'
            type="text"
            placeholder="Search for books..."
            onClick={openModal}
            readOnly
        />
        <SearchModal
            isOpen={isOpen}
            closeModal={closeModal}
        />
    </>
}