import { redirect } from 'next/navigation'
import { signInHref } from '@/components/Links'
import { fetchAuthData } from '@/data/auth'
import { AccountPage } from './AccountPage'

export default async function Page() {
    const user = await fetchAuthData()
    if (!user) {
        redirect(signInHref())
    }
    return <AccountPage account={{
        name: user.name,
        joined: user.joined,
    }} />
}