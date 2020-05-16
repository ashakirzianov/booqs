import { ReactNode, createElement } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import fetch from 'isomorphic-unfetch';
import { initialPaletteData } from './palette';
import { restoreAuthToken, initialAuthData, initAuth } from './auth';
import { initialUploadStateData } from './upload';


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
const initialData = {
    data: {
        ...initialPaletteData,
        ...initialAuthData,
        ...initialUploadStateData,
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
