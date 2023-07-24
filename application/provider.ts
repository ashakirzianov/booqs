import { ReactNode, createElement } from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient, OperationVariables, QueryOptions, InMemoryCache, ApolloLink, DocumentNode } from '@apollo/client'
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

export async function doServerQuery(query: DocumentNode) {
    const url = process.env.NEXT_PUBLIC_BACKEND
    if (url === undefined)
        throw new Error('NEXT_PUBLIC_BACKEND is undefined')
    const response = await fetch(
        url,
        {
            method: 'POST',
            body: JSON.stringify({
                query: query.loc?.source.body,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
    const data = await response.json()
    return data.data
}
