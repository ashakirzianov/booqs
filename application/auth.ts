'use client'
import { ApolloClient, useApolloClient, gql, useMutation } from '@apollo/client'
import { social } from './social'
import { useAppState, useAppStateSetter } from './state'

export type User = {
    id: string,
    username: string,
    name: string,
    joined: string,
    pictureUrl?: string,
};
export type AuthState = User & {
    provider: string,
}
type AuthStateSetter = (f: (value?: AuthState) => AuthState | undefined) => void

export function useAuth() {
    const current = useAppState().currentUser

    if (current) {
        return {
            signed: true, // TODO: remove?
            ...current,
            provider: current.provider,
        } as const
    } else {
        return undefined
    }
}

export function useSignInOptions() {
    const client = useApolloClient()
    const userDataSetter = useAppStateSetter()
    function authSetter(f: (value?: AuthState) => AuthState | undefined) {
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


async function signOut(client: ApolloClient<unknown>, setter: AuthStateSetter) {
    const result = await client.mutate<{ signout: boolean }>({
        mutation: gql`mutation Signout {
            signout
        }`,
    })
    if (result?.data?.signout) {
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

const AuthMutation = gql`mutation Auth($token: String!, $provider: String!) {
    auth(token: $token, provider: $provider) {
        token
        user {
            id
            username
            name
            joined
            pictureUrl
        }
    }
}`
type AuthData = {
    auth: {
        token: string,
        user: {
            id: string,
            username: string,
            name: string,
            joined: string,
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
    authSetter: AuthStateSetter,
    token: string,
    name?: string,
    provider: string,
}) {
    const result = await apolloClient.mutate<AuthData, AuthVariables>({
        mutation: AuthMutation,
        variables: { token, provider, name },
    })
    if (result.data) {
        let auth = result.data.auth
        const data: AuthState | undefined = auth
            ? {
                id: auth.user.id,
                username: auth.user.username,
                name: auth.user.name ?? undefined,
                pictureUrl: auth.user.pictureUrl ?? undefined,
                joined: auth.user.joined,
                provider,
            }
            : undefined
        authSetter(() => data)
        apolloClient.reFetchObservableQueries(true)
        return auth
    } else {
        return undefined
    }
}

export function useDeleteAccount() {
    let client = useApolloClient()
    const userDataSetter = useAppStateSetter()
    let [deleteAccount, { loading, data, error }] = useMutation<{ deleteAccound: boolean }>(gql`mutation DeleteAccount {
        deleteAccount
    }`)
    return {
        loading,
        data,
        error,
        async deleteAccount() {
            await deleteAccount()
            userDataSetter(data_1 => ({
                ...data_1,
                currentUser: undefined,
            }))
            client.resetStore()
        },
    }
}