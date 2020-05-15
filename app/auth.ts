import { gql, ApolloClient } from "apollo-boost";
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import { facebookLogin, facebookStatus } from "./facebookSdk";

export function restoreAuthToken() {
    return window?.sessionStorage?.getItem('auth');
}
function storeAuthToken(token: string) {
    window?.sessionStorage?.setItem('auth', token);
}

export async function initAuth(client: ApolloClient<object>) {
    const fbStatus = await facebookStatus();
    if (fbStatus.status === 'connected') {
        signIn(client, fbStatus.authResponse.accessToken, 'facebook');
    }
}

type AuthState =
    | { state: 'not-signed' }
    | { state: 'signed', name: string }
    ;
type AuthData = {
    authState: AuthState & { __typename: 'AuthState' },
};
const AuthStateQuery = gql`query SignInState {
    authState @client {
        state
        token
        name
    }
}`;
export const initialAuthData: AuthData = {
    authState: {
        __typename: 'AuthState',
        state: 'not-signed',
    },
};
export function useAuth() {
    const { data } = useQuery<AuthData>(AuthStateQuery);

    return (data ?? initialAuthData).authState;
}

export function useSignInOption() {
    const client = useApolloClient();

    return {
        async signWithFacebook() {
            const status = await facebookLogin();
            if (status.status === 'connected') {
                return signIn(client, status.authResponse.accessToken, 'facebook');
            } else {
                return undefined;
            }
        },
    };
}

async function signIn(client: ApolloClient<object>, token: string, provider: string) {
    const { data: { auth } } = await client.query<{
        auth: {
            token: string,
            name: string,
            profilePicture?: string,
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
        const authState = auth
            ? {
                __typename: 'AuthState',
                state: 'signed',
                name: auth.name,
            } as const
            : initialAuthData.authState;
        storeAuthToken(auth.token);
        client.writeData<AuthData>({
            data: { authState },
        });
    }

    return auth;
}
