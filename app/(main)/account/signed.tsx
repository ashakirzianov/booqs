'use client'
import { useDeleteAccount } from '@/application/auth'
import { feedHref } from '@/components/Links'
import { Modal } from '@/components/Modal'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignedIn({ account }: {
    account: {
        name: string,
        joined: string,
    },
}) {
    let { deleteAccount } = useDeleteAccount()
    let [modal, setModal] = useState(false)
    let { push } = useRouter()
    function openModal() {
        setModal(true)
    }
    function closeModal() {
        setModal(false)
    }
    async function performDelete() {
        await deleteAccount()
        push(feedHref())
    }
    return (
        <div className='flex w-full justify-center'>
            <div className='flex flex-col w-panel max-w-full gap-2'>
                <h1 className='font-bold'>{account.name}</h1>
                <p>Joined {formatDate(account.joined)}</p>
                <button className='text-alert font-bold max-w-fit p-2 rounded border-2 border-alert hover:bg-alert hover:text-background' onClick={openModal}>Delete Account</button>
            </div>
            <Modal isOpen={modal} closeModal={closeModal}>
                <div className='flex flex-col w-panel max-w-full gap-2 p-4'>
                    <h1 className='font-bold'>Are you sure you want to delete your account?</h1>
                    <p>This action cannot be undone.</p>
                    <div className='flex gap-2'>
                        <button tabIndex={2} className='text-alert font-bold max-w-fit p-2 rounded border-2 border-alert hover:bg-alert hover:text-background' onClick={performDelete}>Delete Account</button>
                        <button tabIndex={1} className='text-primary font-bold max-w-fit p-2 rounded border-2 border-primary hover:bg-primary hover:text-background' onClick={closeModal}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

function formatDate(date: string) {
    let d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}