'use client'
import { ReactNode, createElement } from 'react'
import {
    ApolloClient, OperationVariables, QueryOptions, InMemoryCache, ApolloLink, ApolloProvider,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { AppStateProvider } from './state'

const link = ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
            graphQLErrors.forEach(({ message, locations, path }) =>
                console.log(
                    `[GraphQL error]: Message: ${message}, Location: ${locations?.join(' ')}, Path: ${path?.join(' ')}`,
                ),
            )
        if (networkError) console.log(`[Network error]: ${networkError}`)
    }),
])

const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    resolvers: {},
})

export function AppProvider({ children }: {
    children: ReactNode,
}) {
    return createElement(
        ApolloProvider,
        {
            client,
            children: createElement(
                AppStateProvider,
                null,
                children,
            ),
        },
    )
}

export function doQuery<Data = any, Vars extends OperationVariables = OperationVariables>(options: QueryOptions<Vars>) {
    return client.query<Data, Vars>({
        ...options,
        fetchPolicy: 'network-only',
    })
}
