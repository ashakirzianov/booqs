'use client'
import { ApolloClient, useApolloClient, gql, useMutation } from '@apollo/client'
import {
    browserSupportsWebAuthn, startRegistration,
    RegistrationResponseJSON, PublicKeyCredentialCreationOptionsJSON,
} from '@simplewebauthn/browser'
import { social } from './social'
import { useAppState, useAppStateSetter } from './state'
import { useState } from 'react'

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

export function useSocialSignIn() {
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

export function usePasskeyAuthn() {
    const InitPasskeyRegistrationMutation = gql`mutation InitPasskeyRegistration($username: String!) {
        initPasskeyRegistration
    }`

    type InitPasskeyRegistrationData = {
        initPasskeyRegistration: {
            id: string,
            options: PublicKeyCredentialCreationOptionsJSON,
        },
    };
    const [initPasskeyRegistration] = useMutation<InitPasskeyRegistrationData>(InitPasskeyRegistrationMutation)

    const VerifyPasskeyRegistrationMutation = gql`mutation VerifyPasskeyRegistration($response: String!, $id: String!) {
        verifyPasskeyRegistration(response: $response, id: $id)
    }`
    type VerifyPasskeyRegistrationData = {
        verifyPasskeyRegistration: boolean,
    }
    type VerifyPasskeyRegistrationVariables = {
        response: RegistrationResponseJSON,
        id: string,
    }
    const [verifyPasskeyRegistration] = useMutation<VerifyPasskeyRegistrationData, VerifyPasskeyRegistrationVariables>(VerifyPasskeyRegistrationMutation)

    type AuthnState = {
        state: 'not-started',
    } | {
        state: 'error',
        error: string,
    } | {
        state: 'registred',
    }
    const [state, setState] = useState<AuthnState>({ state: 'not-started' })

    return {
        state,
        async registerPasskey() {
            if (!browserSupportsWebAuthn()) {
                setState({
                    state: 'error',
                    error: 'Your browser does not support WebAuthn',
                });
                return;
            }
            try {
                const initResult = await initPasskeyRegistration()
                if (!initResult.data?.initPasskeyRegistration) {
                    setState({
                        state: 'error',
                        error: 'Failed to get registration options',
                    });
                    return;
                }
                const { id, options } = initResult.data?.initPasskeyRegistration

                const attestationResponse = await startRegistration({
                    optionsJSON: options,
                })
                const verifyResult = await verifyPasskeyRegistration({
                    variables: {
                        id,
                        response: attestationResponse,
                    }
                });
                if (!verifyResult.data?.verifyPasskeyRegistration) {
                    setState({
                        state: 'error',
                        error: 'Failed to verify registration',
                    });
                    return;
                }
                setState({
                    state: 'registred',
                });
            } catch (e: any) {
                setState({
                    state: 'error',
                    error: e?.toString(),
                });
            }
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