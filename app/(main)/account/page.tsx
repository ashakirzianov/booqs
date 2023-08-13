import { fetchQuery } from '@/application/server'
import { gql } from '@apollo/client'
import { cookies } from 'next/headers'
import SignedIn from './signed'
import { AppProvider } from '@/application/provider'
import NotSigned from './not-signed'

export default async function Account() {
    let me = await fetchMe()
    return me
        ? <AppProvider>
            <SignedIn account={me} />
        </AppProvider>
        : <AppProvider>
            <NotSigned />
        </AppProvider>
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
            name: string,
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