'use client'
import { ReactNode, createElement } from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import {
    ApolloClient, OperationVariables, QueryOptions, InMemoryCache, ApolloLink,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { createUploadLink } from 'apollo-upload-client'
import { UserDataProvider } from './userData'

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
    createUploadLink({
        uri: process.env.NEXT_PUBLIC_BACKEND,
        credentials: 'include',
        fetch,
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
                UserDataProvider,
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
