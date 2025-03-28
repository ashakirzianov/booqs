'use client'
import { ApolloClient, useApolloClient, gql, useMutation } from '@apollo/client'
import {
    browserSupportsWebAuthn, startRegistration, startAuthentication,
    RegistrationResponseJSON, AuthenticationResponseJSON,
    PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'
import { social } from './social'
import { useAppState, useAppStateSetter } from './state'
import { useState } from 'react'

export type User = {
    id: string,
    username: string,
    joined: string,
    name?: string,
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
    const client = useApolloClient()
    const userDataSetter = useAppStateSetter()
    type AuthnState =
        | {
            state: 'not-started',
        }
        | {
            state: 'error',
            error: string,
        }
        | {
            state: 'registering',
        }
        | {
            state: 'signing',
        }
        | {
            state: 'signed',
            user: User,
        }
    const [state, setState] = useState<AuthnState>({ state: 'not-started' })

    return {
        state,
        async register() {
            if (!browserSupportsWebAuthn()) {
                setState({
                    state: 'error',
                    error: 'Your browser does not support WebAuthn',
                })
                return
            }
            setState({
                state: 'registering',
            });
            const result = await registerPasskey(client)
            if (result.success) {
                setState({
                    state: 'signed',
                    user: result.user,
                })
                userDataSetter(data => ({
                    ...data,
                    currentUser: {
                        ...result.user,
                        provider: 'passkey',
                    },
                }))
            } else {
                setState({
                    state: 'error',
                    error: result.error,
                })
            }
        },
        async signIn() {
            if (!browserSupportsWebAuthn()) {
                setState({
                    state: 'error',
                    error: 'Your browser does not support WebAuthn',
                });
                return;
            }
            setState({
                state: 'signing',
            });
            const result = await signInWithPasskey(client)
            if (result.success) {
                setState({
                    state: 'signed',
                    user: result.user,
                })
                userDataSetter(data => ({
                    ...data,
                    currentUser: {
                        ...result.user,
                        provider: 'passkey',
                    },
                }))
            } else {
                setState({
                    state: 'error',
                    error: result.error,
                })
            }
        },
    }
}

async function registerPasskey(client: ApolloClient<unknown>) {
    try {
        const InitPasskeyRegistrationMutation = gql`mutation InitPasskeyRegistration {
            initPasskeyRegistration
        }`
        type InitPasskeyRegistrationData = {
            initPasskeyRegistration: {
                id: string,
                options: PublicKeyCredentialCreationOptionsJSON,
            },
        };
        const initResult = await client.mutate<InitPasskeyRegistrationData>({
            mutation: InitPasskeyRegistrationMutation,
        })
        if (!initResult.data?.initPasskeyRegistration) {
            return {
                success: false as const,
                error: 'Failed to initialize passkey registration',
            }
        }

        const { id, options } = initResult.data?.initPasskeyRegistration
        const attestationResponse = await startRegistration({
            optionsJSON: options,
        })

        const VerifyPasskeyRegistrationMutation = gql`mutation VerifyPasskeyRegistration($response: String!, $id: String!) {
            verifyPasskeyRegistration(response: $response, id: $id) {
                id
                username
                joined
                name
                pictureUrl
            }
        }`
        type VerifyPasskeyRegistrationData = {
            verifyPasskeyRegistration?: {
                id: string,
                username: string,
                joined: string,
                name?: string,
                pictureUrl?: string,
            },
        }
        type VerifyPasskeyRegistrationVariables = {
            response: RegistrationResponseJSON,
            id: string,
        }
        const verifyResult = await client.mutate<VerifyPasskeyRegistrationData, VerifyPasskeyRegistrationVariables>({
            mutation: VerifyPasskeyRegistrationMutation,
            variables: {
                id,
                response: attestationResponse,
            }
        });
        if (!verifyResult.data?.verifyPasskeyRegistration) {
            return {
                success: false as const,
                error: 'Failed to verify passkey registration',
            }
        }
        return {
            success: true as const,
            user: verifyResult.data.verifyPasskeyRegistration,
        }
    } catch (e: any) {
        return {
            success: false as const,
            error: e.toString(),
        }
    }
}

async function signInWithPasskey(client: ApolloClient<unknown>) {
    try {
        const InitPasskeyLoginMutation = gql`mutation InitPasskeyLogin {
            initPasskeyLogin
        }`
        type InitPasskeyLoginData = {
            initPasskeyLogin: {
                id: string,
                options: PublicKeyCredentialRequestOptionsJSON,
            },
        };
        const initResult = await client.mutate<InitPasskeyLoginData>({
            mutation: InitPasskeyLoginMutation,
        })
        if (!initResult.data?.initPasskeyLogin) {
            return {
                success: false as const,
                error: 'Failed to initialize passkey login',
            }
        }

        const { id, options } = initResult.data?.initPasskeyLogin
        const attestationResponse = await startAuthentication({
            optionsJSON: options,
        })

        const VerifyPasskeyLoginMutation = gql`mutation VerifyPasskeyLogin($response: String!, $id: String!) {
            verifyPasskeyLogin(response: $response, id: $id) {
                id
                username
                joined
                name
                pictureUrl
            }
        }`
        type VerifyPasskeyLoginData = {
            verifyPasskeyLogin?: {
                id: string,
                username: string,
                joined: string,
                name?: string,
                pictureUrl?: string,
            },
        }
        type VerifyPasskeyLoginVariables = {
            response: AuthenticationResponseJSON,
            id: string,
        }
        const verifyResult = await client.mutate<VerifyPasskeyLoginData, VerifyPasskeyLoginVariables>({
            mutation: VerifyPasskeyLoginMutation,
            variables: {
                id,
                response: attestationResponse,
            }
        });
        if (!verifyResult.data?.verifyPasskeyLogin) {
            return {
                success: false as const,
                error: 'Failed to verify passkey registration',
            }
        }
        return {
            success: true as const,
            user: verifyResult.data.verifyPasskeyLogin,
        }
    } catch (e: any) {
        return {
            success: false as const,
            error: e.toString(),
        }
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