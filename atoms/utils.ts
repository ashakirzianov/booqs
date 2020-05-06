import { ReactNode } from "react";

type FunctionComponent<P extends {}> = (props: P) => ReactNode;

export type PropsType<T extends FunctionComponent<any>> =
    T extends FunctionComponent<infer P> ? P : never;
