import { ReactNode, createElement } from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient, OperationVariables, QueryOptions } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { createUploadLink } from 'apollo-upload-client';
import { RecoilRoot } from 'recoil';

const link = ApolloLink.from([
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
        credentials: 'include',
        fetch,
    }),
]);

const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    resolvers: {},
});

export function AppProvider({ children }: {
    children: ReactNode,
}) {
    return createElement(
        ApolloProvider,
        {
            client,
            children: createElement(
                RecoilRoot,
                {},
                children,
            ),
        },
    );
}

export function doQuery<Data = any, Vars = OperationVariables>(options: QueryOptions<Vars>) {
    return client.query<Data, Vars>({
        ...options,
        fetchPolicy: 'network-only',
    });
}
