import { ReactNode, createElement } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import fetch from 'isomorphic-unfetch';
import { initialPaletteData } from './palette';

export * from './palette';

const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_BACKEND,
    fetch: fetch,
    resolvers: [],
});
client.cache.writeData({
    data: {
        ...initialPaletteData,
    },
});

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
