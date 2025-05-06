'use client'
import { createElement } from 'react'
import { ThemeProvider } from './theme'
import { ConnectedApolloProvider } from './apollo'

export function AppProvider({ children }: {
    children: React.ReactNode,
}) {
    return createElement(
        ThemeProvider,
        {
            children: createElement(
                ConnectedApolloProvider,
                { children },
            ),
        },
    )
}