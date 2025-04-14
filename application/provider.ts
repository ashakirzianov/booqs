'use client'
import { createElement } from 'react'
import { AuthProvider } from './auth'
import { ThemeProvider } from './theme'

export function AppProvider({ children }: {
    children: React.ReactNode,
}) {
    return createElement(
        AuthProvider,
        {
            children: createElement(
                ThemeProvider,
                {
                    children,
                },
            ),
        },
    )
}