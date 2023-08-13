'use client'
import { useSignInModal } from '@/components/SignIn'

export default function NotSigned() {
    const { openModal, ModalContent } = useSignInModal()
    return <div className='flex flex-col w-full items-center justify-center h-60'>
        <span className='font-bold mb-lg'>
            <span className='cursor-pointer underline decoration-2 text-action hover:text-highlight' onClick={openModal}>Sign in</span> to see account details
        </span>
        {ModalContent}
    </div>
}