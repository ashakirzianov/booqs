'use client'
import { ReactNode, createContext, createElement, useEffect, useMemo, useRef, useState } from 'react'

// TODO: investigate rerenders
type StateConstraint = object | string | number | boolean
export function makeStateProvider<State extends StateConstraint>({
    initialData, onMount,
}: {
    key: string,
    initialData: State,
    onMount?: (data: State, setData: (data: State) => void) => void,
}) {

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
            setData,
        }), [data])
        const ref = useRef(value)
        // On mount hook
        useEffect(() => {
            if (onMount) {
                onMount(ref.current.data, ref.current.setData)
            }
        }, [ref])

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