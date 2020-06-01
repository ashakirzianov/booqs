import { ReactNode, useEffect } from "react";

type FunctionComponent<P extends {}> = (props: P) => ReactNode;

export type PropsType<T extends FunctionComponent<any>> =
    T extends FunctionComponent<infer P> ? P : never;

export type HasChildren = { children: ReactNode };

export function useDocumentEvent<K extends keyof DocumentEventMap>(name: K, listener: (e: DocumentEventMap[K]) => void) {
    useEffect(() => {
        window.document.addEventListener(name, listener);
        return () => window.document.removeEventListener(name, listener);
    }, [listener]);
}
