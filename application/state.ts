import { ReactNode, createContext, createElement, useContext, useEffect, useState } from 'react'
import { syncStorageCell } from './storage'
import type { AuthState } from './auth'
import { Settings } from './settings'
import { NavigationState } from './navigation'

export type SetterOrUpdater<T> = (value: T | ((prev: T) => T)) => void
export type AppState = {
    currentUser?: AuthState,
    settings: Settings,
    navigationState: NavigationState,
}

const key = 'user-data'
const storage = syncStorageCell<AppState>(key, '0.1.0')
const initialData: AppState = {
    currentUser: undefined,
    settings: {
        fontScale: 120,
    },
    navigationState: {
        showChapters: true,
        showHighlights: true,
        showAuthors: [],
    },
}

const userContext = createContext({
    data: initialData,
    setData: (data: AppState | ((v: AppState) => AppState)) => { },
})

export function AppStateProvider({ children }: {
    children: ReactNode,
}) {
    const [data, setData] = useState(initialData)
    // Restore on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let restored = storage.restore()
            if (restored) {
                setData(restored)
            }
        }
    }, [])
    // Handle storage events from this tab
    useEffect(() => {
        return storage.subscribe(data => {
            console.log('storage updated', data)
            setData(data)
        })
    }, [])
    // Handle storage events from other tabs
    useEffect(() => {
        function handleStorage(e: StorageEvent) {
            if (e.key === key) {
                let restored = storage.restore()
                if (restored) {
                    setData(restored)
                }
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => {
            window.removeEventListener('storage', handleStorage)
        }
    }, [])
    return createElement(
        userContext.Provider,
        {
            value: {
                data,
                setData(setter) {
                    if (typeof setter === 'function') {
                        const value = setter(data)
                        // setData(value)
                        storage.store(value)
                    } else {
                        // setData(data)
                        storage.store(data)
                    }
                }
            }
        },
        children
    )
}

export function useAppState() {
    return useContext(userContext).data
}

export function useAppStateSetter() {
    return useContext(userContext).setData
}