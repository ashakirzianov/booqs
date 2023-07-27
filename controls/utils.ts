import { ReactNode, useEffect } from 'react'

type FunctionComponent<P extends {}> = (props: P) => ReactNode;

export type PropsType<T extends FunctionComponent<any>> =
    T extends FunctionComponent<infer P> ? P : never;

export type HasChildren = { children: ReactNode };

export function useDocumentEvent<K extends keyof DocumentEventMap>(name: K, listener: (e: DocumentEventMap[K]) => void) {
    return useCustomDocumentEvent<DocumentEventMap[K]>(name, listener)
}

export function useCustomDocumentEvent<T>(name: string, listener: (e: T) => void) {
    useEffect(() => {
        window.document.addEventListener(name as any, listener)
        return () => window.document.removeEventListener(name as any, listener)
    }, [listener])
}
