import { ReactNode } from "react";

type FunctionComponent<P extends {}> = (props: P) => ReactNode;

export type PropsType<T extends FunctionComponent<any>> =
    T extends FunctionComponent<infer P> ? P : never;

export type HasChildren = { children: ReactNode };

export function eventSubscription<K extends keyof DocumentEventMap>(name: K, listener: (e: DocumentEventMap[K]) => void) {
    window.document.addEventListener(name, listener);
    return () => window.document.removeEventListener(name, listener);
}
