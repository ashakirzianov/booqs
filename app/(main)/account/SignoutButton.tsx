'use client'
import { useRouter } from 'next/navigation'
import { signOutAction } from '@/data/auth'
import { feedHref } from '@/application/href'
import { BorderButton } from '@/components/Buttons'

export function SignoutButton() {
    const router = useRouter()
    async function signout() {
        const result = await signOutAction()
        if (result) {
            router.push(feedHref())
        }
    }
    return <BorderButton text="Sign Out" onClick={signout} />
}