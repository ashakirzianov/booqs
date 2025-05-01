'use client'
import { useRouter } from 'next/navigation'
import { signOutAction } from '@/data/auth'
import { feedHref } from '@/components/Links'
export function SignoutButton() {
    const router = useRouter()
    async function signout() {
        await signOutAction()
        router.push(feedHref())
    }
    return <button className='text-action hover:text-highlight' onClick={signout}>
        Sign out
    </button>
}