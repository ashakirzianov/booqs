import { ReactNode, createElement } from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient, OperationVariables, QueryOptions } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { createUploadLink } from 'apollo-upload-client';
import fetch from 'isomorphic-unfetch';
import { initialSettingsData } from './settings';
import { restoreAuthToken, initialAuthData, initAuth } from './auth';

const link = ApolloLink.from([
    setContext((_, { headers }) => {
        const token = restoreAuthToken();
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : "",
            },
        };
    }),
    onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
            graphQLErrors.forEach(({ message, locations, path }) =>
                console.log(
                    `[GraphQL error]: Message: ${message}, Location: ${locations?.join(' ')}, Path: ${path?.join(' ')}`,
                ),
            );
        if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    createUploadLink({
        uri: process.env.NEXT_PUBLIC_BACKEND,
        fetch,
    }),
]);

const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    resolvers: {},
});

const initialData = {
    data: {
        ...initialSettingsData,
        ...initialAuthData,
    },
};
client.writeData(initialData);
client.onResetStore(async () => {
    client.writeData(initialData);
});
initAuth(client);

export function AppProvider({ children }: {
    children: ReactNode,
}) {
    return createElement(
        ApolloProvider,
        {
            client,
            children,
        },
    );
}

export function doQuery<Data = any, Vars = OperationVariables>(options: QueryOptions<Vars>) {
    return client.query<Data, Vars>({
        ...options,
        fetchPolicy: 'network-only',
    });
}
