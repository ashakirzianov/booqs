'use client'
import { ReactNode, createContext, createElement, useEffect, useMemo, useRef, useState } from 'react'

// TODO: investigate rerenders
type StateConstraint = object | string | number | boolean
export function makeStateProvider<State extends StateConstraint>({
    key, initialData, onMount,
}: {
    key: string,
    initialData: State,
    onMount?: (data: State, setData: (data: State) => void) => void,
}) {
    const storage = syncStorageCell<State>(key, '0.1.0')

    type ContextValue = {
        data: State,
        setData: (state: State) => void,
    }
    const Context = createContext<ContextValue>({
        data: initialData,
        setData: (_: State | ((v: State) => State)) => {
        },
    })

    function StateProvider({ children }: {
        children: ReactNode,
    }) {
        const [data, setData] = useState(initialData)
        const value = useMemo<ContextValue>(() => ({
            data,
            setData(setter) {
                storage.store(setter)
            },
        }), [data])
        const ref = useRef(value)
        // On mount hook
        useEffect(() => {
            if (onMount) {
                onMount(ref.current.data, ref.current.setData)
            }
        }, [ref])

        // Restore on mount
        useEffect(() => {
            if (typeof window !== 'undefined') {
                const restored = storage.restore()
                if (restored) {
                    setData(restored)
                }
            }
        }, [])
        // Handle storage events from this tab
        useEffect(() => {
            return storage.subscribe(data => {
                setData(data)
            })
        }, [])
        // Handle storage events from other tabs
        useEffect(() => {
            function handleStorage(e: StorageEvent) {
                if (e.key === storage.key) {
                    const restored = storage.restore()
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
            Context.Provider,
            {
                value,
                children,
            }
        )
    }
    return {
        StateProvider,
        Context,
    }
}

type CellValue<T> = {
    value: T,
    version: string | undefined,
}
// type Storage<T> = ReturnType<typeof syncStorageCell<T>>
function syncStorageCell<T>(key: string, version?: string) {
    const storage = typeof window !== 'undefined'
        ? window.localStorage
        : undefined
    const listeners: ((value: T) => void)[] = []
    function store(value: T) {
        const cellValue = {
            value, version,
        }
        storage?.setItem(key, JSON.stringify(cellValue))
        listeners.forEach(listener => listener(value))
    }
    function restore(): T | undefined {
        try {
            const value = storage?.getItem(key)
            const parsed = value
                ? JSON.parse(value) as CellValue<T>
                : undefined
            if (version === parsed?.version) {
                return parsed?.value
            } else {
                return undefined
            }
        } catch {
            return undefined
        }
    }
    function update(value: Partial<T>) {
        const prev = restore()
        if (prev) {
            store({
                ...prev,
                ...value,
            })
        }
    }
    function clear() {
        storage?.removeItem(key)
    }
    function subscribe(listener: (value: T) => void) {
        listeners.push(listener)
        return function unsubscribe() {
            const index = listeners.indexOf(listener)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }
    return {
        store, update, restore, clear, subscribe,
        key,
    }
}