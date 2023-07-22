import { ReactNode, createContext, createElement, useContext, useState } from 'react'
import { syncStorageCell } from '@/plat'
import { CurrentUser } from './auth'
import { Settings } from './settings'
import { NavigationState } from './navigation'

export type SetterOrUpdater<T> = (value: T | ((prev: T) => T)) => void
export type UserData = {
    currentUser: CurrentUser,
    settings: Settings,
    navigationState: NavigationState,
}

const key = 'user-data'
const storage = syncStorageCell<UserData>(key, '0.1.0')
const initialData: UserData = {
    currentUser: undefined,
    settings: {
        paletteName: 'light',
        fontScale: 100,
    },
    navigationState: {
        showChapters: true,
        showHighlights: true,
        showAuthors: [],
    },
}

const userContext = createContext({
    data: initialData,
    setData: (data: UserData | ((v: UserData) => UserData)) => { },
})

export function UserDataProvider({ children }: {
    children: ReactNode,
}) {
    const [data, setData] = useState(storage.restore() ?? initialData)
    return createElement(
        userContext.Provider,
        {
            value: {
                data,
                setData(setter) {
                    if (typeof setter === 'function') {
                        const value = setter(data)
                        setData(value)
                        storage.store(value)
                    } else {
                        setData(data)
                        storage.store(data)
                    }
                }
            }
        },
        children
    )
}

export function useUserData() {
    return useContext(userContext).data
}

export function useUserDataUpdater() {
    return useContext(userContext).setData
}