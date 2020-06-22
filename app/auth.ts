import { ApolloClient } from "apollo-client";
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { syncStorageCell } from "plat";
import { facebookSdk } from "./facebookSdk";

const storage = syncStorageCell<AuthData>('user');

type AuthData = {
    name: string | null,
    pictureUrl: string | null,
    provider: string | null,
};
const AuthStateQuery = gql`query AuthState {
    name @client
    pictureUrl @client
    provider @client
}`;
export const initialAuthData: AuthData = storage.restore() ?? {
    name: null,
    pictureUrl: null,
    provider: null,
};
export type Auth = ReturnType<typeof useAuth>;
export function useAuth() {
    const { data } = useQuery<AuthData>(AuthStateQuery);

    const { name, pictureUrl, provider } = (data ?? initialAuthData);
    if (name) {
        return {
            state: 'signed',
            name, pictureUrl, provider,
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
                    provider: 'facebook', name: null, pictureUrl: null,
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
            signOut(client);
        },
    };
}

async function signOut(client: ApolloClient<unknown>) {
    const result = await client.query<{ logout: boolean }>({
        query: gql`query Logout {
            logout
        }`,
    });
    if (result?.data?.logout) {
        client.writeData<AuthData>({
            data: {
                provider: null, name: null, pictureUrl: null,
            },
        });
        await facebookSdk()?.logout();
        client.resetStore();
        storage.clear();
    }
}

async function signIn(client: ApolloClient<unknown>, token: string, provider: string) {
    const { data: { auth } } = await client.query<{
        auth: {
            token: string,
            user: {
                name: string,
                pictureUrl: string | null,
            },
        },
    }>({
        query: gql`query Auth($token: String!, $provider: String!) {
            auth(token: $token, provider: $provider) {
                token
                user {
                    name
                    pictureUrl
                }
            }
        }`,
        variables: { token, provider },
    });
    if (auth) {
        const data: AuthData = auth
            ? {
                provider,
                name: auth.user.name,
                pictureUrl: auth.user.pictureUrl,
            }
            : initialAuthData;
        storage.store({
            provider,
            name: data.name,
            pictureUrl: data.pictureUrl,
        });
        client.writeData<AuthData>({ data });
        client.reFetchObservableQueries(true);
    }

    return auth;
}
