'use client'

import { feedHref } from '@/application/href'
import { Modal } from '@/components/Modal'
import { deleteAccountAction } from '@/data/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteAccountButton({ account }: {
    account: {
        name: string | undefined,
        joinedAt: string,
    },
}) {
    const [modal, setModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { push } = useRouter()
    
    function openModal() {
        setModal(true)
    }
    
    function closeModal() {
        setModal(false)
        setIsDeleting(false)
    }
    
    async function performDelete() {
        setIsDeleting(true)
        try {
            await deleteAccountAction()
            push(feedHref())
        } catch (error) {
            setIsDeleting(false)
        }
    }
    
    return (
        <>
            <button 
                className='px-4 py-2 text-alert font-medium border border-alert rounded-md hover:bg-alert hover:text-background transition-colors duration-200' 
                onClick={openModal}
            >
                Delete Account
            </button>
            
            <Modal isOpen={modal} closeModal={closeModal}>
                <div className='max-w-sm mx-auto p-6 space-y-4'>
                    <div className='text-center'>
                        <h2 className='text-xl font-bold text-alert mb-2'>
                            Delete Account
                        </h2>
                        <p className='text-dimmed text-sm'>
                            Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                    </div>
                    
                    <div className='bg-background border border-dimmed rounded-md p-4'>
                        <p className='text-sm text-dimmed'>
                            <span className='font-medium'>Account:</span> {account.name || 'Anonymous User'}
                        </p>
                        <p className='text-sm text-dimmed'>
                            <span className='font-medium'>Member since:</span> {formatDate(account.joinedAt)}
                        </p>
                    </div>
                    
                    <div className='flex gap-3 pt-2'>
                        <button 
                            tabIndex={1} 
                            className='flex-1 px-4 py-2 text-primary font-medium border border-primary rounded-md hover:bg-primary hover:text-background transition-colors duration-200' 
                            onClick={closeModal}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button 
                            tabIndex={2} 
                            className='flex-1 px-4 py-2 text-alert font-medium border border-alert rounded-md hover:bg-alert hover:text-background transition-colors duration-200 disabled:opacity-50' 
                            onClick={performDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

function formatDate(date: string) {
    const d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}