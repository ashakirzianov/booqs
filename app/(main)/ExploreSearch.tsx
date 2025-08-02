'use client'

import { SearchModal, useSearchModalState } from './SearchModal'

export function ExploreSearch() {
    const { isOpen, openModal, closeModal } = useSearchModalState()
    return <>
        <input
            className='font-normal border-none text-2xl shadow-lg rounded-lg p-6 w-96 max-w-[90vw] bg-background cursor-pointer
            focus:max-w-auto focus:outline-hidden focus:ring-0 focus:border-none
            placeholder:text-dimmed transition-shadow hover:shadow-xl'
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