// Tippy styles
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/svg-arrow.css';
import 'tippy.js/dist/border.css';
import 'tippy.js/animations/shift-away.css';

// FontAwesome support
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

import { AppProps } from 'next/app';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import fetch from 'isomorphic-unfetch';
import { appConfig } from '../lib';

const client = new ApolloClient({
    uri: appConfig().apiUri,
    fetch: fetch,
});

export default function App({ Component, pageProps }: AppProps) {
    return <ApolloProvider client={client}>
        <Component {...pageProps} />
    </ApolloProvider>;
}
