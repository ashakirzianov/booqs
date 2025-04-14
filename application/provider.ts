'use client'
import { createElement } from 'react'
import { AuthProvider } from './auth'

export function AppProvider({ children }: {
    children: React.ReactNode,
}) {
    return createElement(
        AuthProvider,
        { children },
    )
}