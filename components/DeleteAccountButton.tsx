'use client'

import { feedHref } from '@/common/href'
import { Modal } from '@/components/Modal'
import { BorderButton } from '@/components/Buttons'
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
        } catch {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <BorderButton
                text="Delete Account"
                onClick={openModal}
                color="alert"
            />

            <Modal isOpen={modal} closeModal={closeModal}>
                <div className='w-96 max-w-[90vw] mx-auto p-6 space-y-4'>
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
                        <div className='flex-1'>
                            <BorderButton
                                text="Cancel"
                                onClick={closeModal}
                                color="primary"
                                className="w-full"
                            />
                        </div>
                        <div className='flex-1'>
                            <BorderButton
                                text={isDeleting ? 'Deleting...' : 'Delete Account'}
                                onClick={performDelete}
                                disabled={isDeleting}
                                color="alert"
                                className="w-full"
                            />
                        </div>
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