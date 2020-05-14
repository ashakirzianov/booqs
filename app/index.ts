import { ReactNode, createElement } from 'react';
import { AppProps } from 'next/app';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import fetch from 'isomorphic-unfetch';

const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_BACKEND,
    fetch: fetch,
});

export function App({ Component, pageProps }: AppProps) {
    return createElement(
        ApolloProvider,
        {
            client,
            children: createElement(
                Component,
                pageProps,
            ),
        },
    );
}
