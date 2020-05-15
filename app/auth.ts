import { gql, ApolloClient } from "apollo-boost";
import { useApolloClient, useQuery } from '@apollo/react-hooks';

type AuthState =
    | { state: 'not-signed' }
    | { state: 'signed', token: string, name: string }
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
        signWithFacebook(token: string) {
            return signIn(client, token, 'facebook');
        },
    };
}

async function signIn(client: ApolloClient<object>, token: string, provider: string): Promise<AuthState> {
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
    const authState = auth
        ? {
            __typename: 'AuthState',
            state: 'signed',
            name: auth.name,
            token: auth.token,
        } as const
        : initialAuthData.authState;
    client.writeData<AuthData>({
        data: { authState },
    });
    return authState;
}
