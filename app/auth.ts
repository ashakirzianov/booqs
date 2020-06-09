import { ApolloClient } from "apollo-client";
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { facebookSdk } from "./facebookSdk";
import { syncStorage } from "plat";

type AuthDataWithToken = AuthData & { token: string };
export function restoreAuthData() {
    return syncStorage().restore<AuthDataWithToken>('auth');
}
function storeAuthData(authData: AuthDataWithToken) {
    syncStorage().store('auth', authData);
}
function clearAuthData() {
    syncStorage().clear('auth');
}

type AuthData = {
    name: string | null,
    profilePicture: string | null,
    provider: string | null,
};
const AuthStateQuery = gql`query AuthState {
    name @client
    profilePicture @client
    provider @client
}`;
const restored = restoreAuthData();
export const initialAuthData: AuthData = restored
    ? {
        name: restored.name,
        provider: restored.provider,
        profilePicture: restored.profilePicture ?? null,
    }
    : {
        name: null,
        profilePicture: null,
        provider: null,
    };
export type Auth = ReturnType<typeof useAuth>;
export function useAuth() {
    const { data } = useQuery<AuthData>(AuthStateQuery);

    const { name, profilePicture, provider } = (data ?? initialAuthData);
    if (name) {
        return {
            state: 'signed',
            name, profilePicture, provider,
        } as const;
    } else {
        return { state: 'not-signed', provider } as const;
    }
}

export function useSignInOptions() {
    const client = useApolloClient();

    return {
        async signWithFacebook() {
            client.writeData<AuthData>({
                data: {
                    provider: 'facebook', name: null, profilePicture: null,
                },
            });
            const status = await facebookSdk()?.login();
            if (status?.status === 'connected') {
                return signIn(client, status.authResponse.accessToken, 'facebook');
            } else {
                return undefined;
            }
        },
        async signOut() {
            client.writeData<AuthData>({
                data: {
                    provider: null, name: null, profilePicture: null,
                },
            });
            await facebookSdk()?.logout();
            client.resetStore();
            clearAuthData();
        }
    };
}

async function signIn(client: ApolloClient<unknown>, token: string, provider: string) {
    const { data: { auth } } = await client.query<{
        auth: {
            token: string,
            name: string,
            profilePicture: string | null,
        },
    }>({
        query: gql`query Auth($token: String!, $provider: String!) {
            auth(token: $token, provider: $provider) {
                token
                name
                profilePicture
            }
        }`,
        variables: { token, provider },
    });
    if (auth) {
        const data: AuthData = auth
            ? {
                provider,
                name: auth.name,
                profilePicture: auth.profilePicture,
            }
            : initialAuthData;
        storeAuthData({
            provider,
            token: auth.token,
            name: auth.name,
            profilePicture: data.profilePicture,
        });
        client.writeData<AuthData>({ data });
        client.reFetchObservableQueries(true);
    }

    return auth;
}
