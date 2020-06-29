import { ApolloClient } from "apollo-client";
import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
    atom, useRecoilValue, useSetRecoilState, SetterOrUpdater,
} from "recoil";
import { syncStorageCell, sdks } from "plat";

export type UserData = {
    id: string,
    name: string,
    pictureUrl?: string,
};
export type CurrentUser = {
    user: UserData,
    provider: string,
} | undefined;

const key = 'current-user';
const storage = syncStorageCell<CurrentUser>(key, '0.1.0');
const initialAuthData: CurrentUser = storage.restore() ?? undefined;
storage.store(initialAuthData);
const authState = atom({
    key,
    default: initialAuthData,
});

export function useAuth() {
    const current = useRecoilValue(authState);

    if (current) {
        return {
            signed: true,
            provider: current.provider,
            ...current.user,
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
            const token = await sdks().facebook.signIn();
            if (token) {
                return signIn(client, setter, token, 'facebook');
            } else {
                return undefined;
            }
        },
        async signWithApple() {
            const token = await sdks().apple.signIn();
            if (token) {
                return signIn(client, setter, token, 'apple');
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
        setter(prev => {
            switch (prev?.provider) {
                case 'facebook':
                    sdks().facebook.signOut();
                    break;
            }
            return undefined;
        });
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
                user: {
                    id: auth.user.id,
                    name: auth.user.name,
                    pictureUrl: auth.user.pictureUrl ?? undefined,
                },
                provider,
            }
            : initialAuthData;
        storage.store(data);
        setter(data);
        client.reFetchObservableQueries(true);
    }

    return auth;
}
