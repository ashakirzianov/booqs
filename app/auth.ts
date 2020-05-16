import { gql, ApolloClient } from "apollo-boost";
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import { facebookSdk } from "./facebookSdk";

export function restoreAuthToken() {
    return window?.sessionStorage?.getItem('auth');
}
function storeAuthToken(token: string) {
    window?.sessionStorage?.setItem('auth', token);
}

export async function initAuth(client: ApolloClient<unknown>) {
    const fbStatus = await facebookSdk()?.status();
    if (fbStatus?.status === 'connected') {
        signIn(client, fbStatus.authResponse.accessToken, 'facebook');
    }
}

type AuthData = {
    name: string | null,
    profilePicture: string | null,
};
const AuthStateQuery = gql`query AuthState {
    name @client
    profilePicture @client
}`;
export const initialAuthData: AuthData = {
    name: null,
    profilePicture: null,
};
export function useAuth() {
    const { data } = useQuery<AuthData>(AuthStateQuery);

    const { name, profilePicture } = (data ?? initialAuthData);
    if (name) {
        return {
            state: 'signed',
            name, profilePicture,
        } as const;
    } else {
        return { state: 'not-signed' } as const;
    }
}

export function useSignInOptions() {
    const client = useApolloClient();

    return {
        async signWithFacebook() {
            const status = await facebookSdk()?.login();
            if (status?.status === 'connected') {
                return signIn(client, status.authResponse.accessToken, 'facebook');
            } else {
                return undefined;
            }
        },
        async signOut() {
            await facebookSdk()?.logout();
            client.resetStore();
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
                name: auth.name,
                profilePicture: auth.profilePicture,
            }
            : initialAuthData;
        storeAuthToken(auth.token);
        client.cache.writeData<AuthData>({ data });
    }

    return auth;
}
