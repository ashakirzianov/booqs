import { ApolloClient } from "apollo-client";
import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { syncStorageCell, sdks } from "plat";
import { facebookSdk } from "./facebookSdk";
import { atom, useRecoilValue, useSetRecoilState, SetterOrUpdater } from "recoil";

export type UserData = {
    id: string,
    name: string,
    pictureUrl?: string,
};
export type CurrentUser = UserData | undefined;

const key = 'current-user';
const storage = syncStorageCell<CurrentUser>(key);
const initialAuthData: CurrentUser = storage.restore() ?? undefined;
storage.store(initialAuthData);
const authState = atom({
    key,
    default: initialAuthData,
});

export function useAuth() {
    const {
        id, name, pictureUrl,
    } = useRecoilValue(authState) ?? {};

    if (id && name) {
        return {
            signed: true,
            id, name, pictureUrl,
        } as const;
    } else {
        return undefined;
    }
}

export function useSignInOptions() {
    const client = useApolloClient();
    const setter = useSetRecoilState(authState);

    return {
        async signWithFacebook() {
            const status = await facebookSdk()?.login();
            if (status?.status === 'connected') {
                return signIn(client, setter, status.authResponse.accessToken, 'facebook');
            } else {
                return undefined;
            }
        },
        async signWithApple() {
            const user = await sdks().apple.signIn();
            if (user) {
                return signIn(client, setter, user.token, 'apple');
            }
        },
        async signOut() {
            signOut(client, setter);
        },
    };
}

async function signOut(client: ApolloClient<unknown>, setter: SetterOrUpdater<CurrentUser>) {
    const result = await client.query<{ logout: boolean }>({
        query: gql`query Logout {
            logout
        }`,
    });
    if (result?.data?.logout) {
        setter(undefined);
        await facebookSdk()?.logout();
        client.resetStore();
        storage.clear();
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
}`;
type AuthData = {
    auth: {
        token: string,
        user: {
            id: string,
            name: string,
            pictureUrl: string | null,
        },
    },
};
type AuthVariables = {
    token: string,
    provider: string,
};
async function signIn(client: ApolloClient<unknown>, setter: SetterOrUpdater<CurrentUser>, token: string, provider: string) {
    const { data: { auth } } = await client.query<AuthData, AuthVariables>({
        query: AuthQuery,
        variables: { token, provider },
    });
    if (auth) {
        const data: CurrentUser = auth
            ? {
                id: auth.user.id,
                name: auth.user.name,
                pictureUrl: auth.user.pictureUrl ?? undefined,
            }
            : initialAuthData;
        storage.store(data);
        setter(data);
        client.reFetchObservableQueries(true);
    }

    return auth;
}
