'use client'
import { createElement } from 'react'
import { AuthProvider } from './auth'
import { ThemeProvider } from './theme'
import { ConnectedApolloProvider } from './apollo'

export function AppProvider({ children }: {
    children: React.ReactNode,
}) {
    return createElement(
        AuthProvider,
        {
            children: createElement(
                ThemeProvider,
                {
                    children: createElement(
                        ConnectedApolloProvider,
                        { children },
                    ),
                },
            ),
        },
    )
}