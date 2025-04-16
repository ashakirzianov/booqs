'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppProvider } from '@/application/provider'
import { useAuth } from '@/application/auth'
import { useIsMounted } from '@/application/utils'
import { Spinner } from '@/components/Loading'
import { feedHref } from '@/components/Links'
import { Modal } from '@/components/Modal'
import { SignInModal } from '@/components/SignIn'

export default function Account() {
    const mounted = useIsMounted()
    if (!mounted) {
        return <div className='flex w-full justify-center p-4'>
            <Spinner />
        </div>
    } else {
        return <AppProvider>
            <AccountMounted />
        </AppProvider>
    }
}

function AccountMounted() {
    const { auth } = useAuth()
    return auth.state === 'signed'
        ? <SignedIn account={auth.user} />
        : <NotSigned />
}

function SignedIn({ account }: {
    account: {
        name?: string,
        joined: string,
    },
}) {
    const { deleteAccount } = useAuth()
    const [modal, setModal] = useState(false)
    const { push } = useRouter()
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
                <button className='text-alert font-bold max-w-fit p-2 rounded-sm border-2 border-alert hover:bg-alert hover:text-background' onClick={openModal}>Delete Account</button>
            </div>
            <Modal isOpen={modal} closeModal={closeModal}>
                <div className='flex flex-col w-panel max-w-full gap-2 p-4'>
                    <h1 className='font-bold'>Are you sure you want to delete your account?</h1>
                    <p>This action cannot be undone.</p>
                    <div className='flex gap-2'>
                        <button tabIndex={2} className='text-alert font-bold max-w-fit p-2 rounded-sm border-2 border-alert hover:bg-alert hover:text-background' onClick={performDelete}>Delete Account</button>
                        <button tabIndex={1} className='text-primary font-bold max-w-fit p-2 rounded-sm border-2 border-primary hover:bg-primary hover:text-background' onClick={closeModal}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

function formatDate(date: string) {
    const d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}

function NotSigned() {
    const [isOpen, setIsOpen] = useState(false)
    return <div className='flex flex-col w-full items-center justify-center h-60'>
        <span className='font-bold mb-lg'>
            <span className='cursor-pointer underline decoration-2 text-action hover:text-highlight' onClick={() => setIsOpen(true)}>Sign in</span> to see account details
        </span>
        <SignInModal
            isOpen={isOpen}
            closeModal={() => setIsOpen(false)}
        />
    </div>
}