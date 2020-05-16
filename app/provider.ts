import { ReactNode, createElement } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import fetch from 'isomorphic-unfetch';
import { initialPaletteData } from './palette';
import { restoreAuthToken, initialAuthData, initAuth } from './auth';


const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_BACKEND,
    fetch: fetch,
    resolvers: [],
    request: operation => {
        const token = restoreAuthToken();
        if (token) {
            operation.setContext({
                headers: {
                    authorization: `Bearer ${token}`,
                },
            });
        }
    },
});
client.writeData({
    data: {
        ...initialPaletteData,
        ...initialAuthData,
    },
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
