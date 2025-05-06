'use client'
import { createElement } from 'react'
import { ThemeProvider } from './theme'

export function AppProvider({ children }: {
    children: React.ReactNode,
}) {
    return createElement(
        ThemeProvider,
        {
            children,
        },
    )
}