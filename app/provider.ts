import { ReactNode, createElement } from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import fetch from 'isomorphic-unfetch';
import { initialPaletteData } from './palette';
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
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                ),
            );
        if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    new HttpLink({
        uri: process.env.NEXT_PUBLIC_BACKEND,
        credentials: 'same-origin',
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
        ...initialPaletteData,
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
