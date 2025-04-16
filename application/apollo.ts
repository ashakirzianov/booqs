import { ReactNode, createElement } from 'react'
import {
    ApolloClient, OperationVariables, QueryOptions, InMemoryCache, ApolloLink, ApolloProvider, HttpLink,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const link = ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
            graphQLErrors.forEach(({ message, locations, path }) =>
                console.error(
                    `[GraphQL error]: Message: ${message}, Location: ${locations?.join(' ')}, Path: ${path?.join(' ')}`,
                ),
            )
        if (networkError) console.error(`[Network error]: ${networkError}`)
    }),
    new HttpLink({
        uri: `/api/graphql`,
        credentials: 'include',
    }),
])

const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    resolvers: {},
})

export function ConnectedApolloProvider({ children }: {
    children: ReactNode,
}) {
    return createElement(
        ApolloProvider,
        {
            client,
            children,
        },
    )
}

export function doQuery<Data = any, Vars extends OperationVariables = OperationVariables>(options: QueryOptions<Vars>) {
    return client.query<Data, Vars>({
        ...options,
        fetchPolicy: 'network-only',
    })
}