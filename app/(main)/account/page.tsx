import { fetchQuery } from '@/application/server'
import { gql } from '@apollo/client'
import { cookies } from 'next/headers'

export default async function Account() {
    let me = await fetchMe()
    return (
        <div>
            <h1>Account</h1>
            <p>{me?.name ?? 'undef'}</p>
            <p>{me?.joined}</p>
        </div>
    )
}

async function fetchMe() {
    const MeQuery = gql`query Me {
        me {
            username
            name
            pictureUrl
            joined
        }
    }`
    type MeData = {
        me: {
            username: string,
            joined: string,
            name?: string,
            pictureUrl?: string,
        },
    };

    let cs = cookies().getAll()
    let cookie = cs.map(c => `${c.name}=${c.value}`).join('; ')
    const result = await fetchQuery<MeData>({
        query: MeQuery,
        options: {
            headers: {
                'Cookie': cookie,
            },
            cache: 'no-cache',
        }
    })
    return result.success
        ? result.data?.me
        : undefined
}