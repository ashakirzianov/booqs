import { ApolloClient } from '@apollo/client'
import { useApolloClient } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { social } from './social'
import { useUserData, useUserDataUpdater } from './userData'

export type UserInfo = {
    id: string,
    name?: string,
    pictureUrl?: string,
};
export type CurrentUser = {
    user: UserInfo,
    provider: string,
} | undefined;

type Setter<T> = (f: (value: T) => T) => void
export function useAuth() {
    const current = useUserData().currentUser

    if (current) {
        return {
            signed: true,
            provider: current.provider,
            ...current.user,
        } as const
    } else {
        return undefined
    }
}

export function useSignInOptions() {
    const client = useApolloClient()
    const userDataSetter = useUserDataUpdater()
    function authSetter(f: (value: CurrentUser) => CurrentUser) {
        userDataSetter(data => ({
            ...data,
            currentUser: f(data.currentUser),
        }))
    }

    return {
        async signWithFacebook() {
            const { token } = await social().facebook.signIn() ?? {}
            if (token) {
                return signIn({
                    apolloClient: client,
                    authSetter,
                    token,
                    provider: 'facebook',
                })
            } else {
                return undefined
            }
        },
        async signWithApple() {
            const { token, name } = await social().apple.signIn() ?? {}
            if (token) {
                return signIn({
                    provider: 'apple',
                    apolloClient: client,
                    authSetter,
                    token,
                    name,
                })
            }
        },
        async signOut() {
            signOut(client, authSetter)
        },
    }
}


async function signOut(client: ApolloClient<unknown>, setter: (f: (value: CurrentUser) => CurrentUser) => void) {
    const result = await client.query<{ logout: boolean }>({
        query: gql`query Logout {
            logout
        }`,
    })
    if (result?.data?.logout) {
        setter(prev => {
            switch (prev?.provider) {
                case 'facebook':
                    social().facebook.signOut()
                    break
            }
            return undefined
        })
        client.resetStore()
    }
}

const AuthQuery = gql`query Auth($token: String!, $provider: String!) {
    auth(token: $token, provider: $provider) {
        token
        user {
            id
            name
            pictureUrl
        }
    }
}`
type AuthData = {
    auth: {
        token: string,
        user: {
            id: string,
            name: string | null,
            pictureUrl: string | null,
        },
    },
};
type AuthVariables = {
    token: string,
    provider: string,
    name?: string,
};
async function signIn({
    apolloClient, authSetter, token, name, provider,
}: {
    apolloClient: ApolloClient<object>,
    authSetter: Setter<CurrentUser>,
    token: string,
    name?: string,
    provider: string,
}) {
    const { data: { auth } } = await apolloClient.query<AuthData, AuthVariables>({
        query: AuthQuery,
        variables: { token, provider, name },
    })
    if (auth) {
        const data: CurrentUser = auth
            ? {
                user: {
                    id: auth.user.id,
                    name: auth.user.name ?? undefined,
                    pictureUrl: auth.user.pictureUrl ?? undefined,
                },
                provider,
            }
            : undefined
        authSetter(() => data)
        apolloClient.reFetchObservableQueries(true)
    }

    return auth
}
