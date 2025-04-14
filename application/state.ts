'use client'
import { ReactNode, createContext, createElement, useEffect, useMemo, useRef, useState } from 'react'

type StateConstraint = object | string | number | boolean
export type SetterOrValue<State> = State | ((state: State) => State)
export type StateSetter<State> = (setterOrValue: SetterOrValue<State>) => void
export function makeStateProvider<State extends StateConstraint>({
    initialData, onMount,
}: {
    key: string,
    initialData: State,
    onMount?: (data: State, setData: StateSetter<State>) => void,
}) {

    type ContextValue = {
        data: State,
        setData: StateSetter<State>,
    }
    const Context = createContext<ContextValue>({
        data: initialData,
        setData: () => {
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