'use client'

import { useSearchModalState, SearchModal } from './SearchModal'

export function Search() {
    const { isOpen, openModal, closeModal } = useSearchModalState()
    return <>
        <input
            className='font-normal border-none text-xl shadow rounded p-4 max-h-12 w-40 bg-background cursor-pointer
            focus:max-w-auto focus:outline-hidden focus:ring-0 focus:border-none dark:shadow-slate-800
            placeholder:text-dimmed'
            type="text"
            placeholder="Search..."
            onClick={openModal}
            readOnly
        />
        <SearchModal
            isOpen={isOpen}
            closeModal={closeModal}
        />
    </>
}
