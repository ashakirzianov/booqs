import { fetchMeServer } from '@/app/fetch'
import { cookies } from 'next/headers'

export default async function Account() {
    let cs = cookies().getAll()
    let me = await fetchMeServer(cs)
    return (
        <div>
            <h1>Account</h1>
            <p>{me?.name ?? 'undef'}</p>
            <p>{me?.joined}</p>
        </div>
    )
}