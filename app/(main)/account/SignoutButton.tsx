'use client'
import { useRouter } from 'next/navigation'
import { signOutAction } from '@/data/auth'
import { feedHref } from '@/application/href'
export function SignoutButton() {
    const router = useRouter()
    async function signout() {
        const result = await signOutAction()
        if (result) {
            router.push(feedHref())
        }
    }
    return <button className='text-action hover:text-highlight' onClick={signout}>
        Sign out
    </button>
}