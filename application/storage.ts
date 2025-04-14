import { useEffect, useRef } from 'react'

type CellValue<T> = {
    value: T,
    version: string | undefined,
}
export type Storage<T> = ReturnType<typeof syncStorageCell<T>>
export function syncStorageCell<T>(key: string, version?: string) {
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

type DataSetter<T> = (data: T) => void
export function useSyncEffects<T>(storage: Storage<T>, setData: DataSetter<T>) {
    const ref = useRef({ storage, setData })
    // Restore on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const restored = ref.current.storage.restore()
            if (restored) {
                ref.current.setData(restored)
            }
        }
    }, [ref])
    // Handle storage events from this tab
    useEffect(() => {
        return ref.current.storage.subscribe(data => {
            ref.current.setData(data)
        })
    }, [ref])
    // Handle storage events from other tabs
    useEffect(() => {
        function handleStorage(e: StorageEvent) {
            if (e.key === ref.current.storage.key) {
                const restored = ref.current.storage.restore()
                if (restored) {
                    ref.current.setData(restored)
                }
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => {
            window.removeEventListener('storage', handleStorage)
        }
    }, [ref])
}